// ============================================
// Radha Bali - POST /api/chat
// Main chat endpoint with streaming support
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, continueWithToolResult } from '@/lib/gemini';
import { executeTool } from '@/lib/tools';
import { checkRateLimit, getClientKey } from '@/lib/rate-limit';
import { getCachedResponse, setCachedResponse } from '@/lib/cache';
import { getServerSupabaseClient } from '@/lib/supabase';
import type { ChatMessage, ChatResponse, ProductCard, GeminiFunctionCall } from '@/lib/types';

// Max function call iterations to prevent infinite loops
const MAX_TOOL_ITERATIONS = 3;
const MAX_MESSAGE_LENGTH = 500;

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit check
    const clientKey = getClientKey(request);
    const rateLimit = await checkRateLimit(clientKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak permintaan. Silakan tunggu sebentar.',
          retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)),
          },
        },
      );
    }

    // 2. Parse & validate request
    const body = await request.json();
    const { message, session_id, history } = body as {
      message?: string;
      session_id?: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong.' }, { status: 400 });
    }

    // Sanitize input
    const sanitizedMessage = message
      .trim()
      .slice(0, MAX_MESSAGE_LENGTH)
      .replace(/[<>]/g, ''); // Strip HTML tags

    if (sanitizedMessage.length === 0) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong.' }, { status: 400 });
    }

    // 3. Generate or retrieve session ID
    const currentSessionId = session_id || crypto.randomUUID();

    // 4. Check cache (only for messages without history context)
    if (!history || history.length === 0) {
      const cached = await getCachedResponse(sanitizedMessage);
      if (cached) {
        return NextResponse.json({
          ...cached,
          session_id: currentSessionId,
          cached: true,
        });
      }
    }

    // 5. Load conversation history from DB if not provided
    let chatHistory: ChatMessage[] = history || [];
    if (chatHistory.length === 0 && session_id) {
      chatHistory = await loadConversationHistory(session_id);
    }

    // Limit history to last 10 messages for token efficiency
    const trimmedHistory = chatHistory.slice(-10);

    // 6. Generate response with Gemini (function calling loop)
    let allProducts: ProductCard[] = [];
    let finalText: string | null = null;
    let currentFunctionCall: GeminiFunctionCall | null = null;
    let iterations = 0;

    // Initial call to Gemini
    const initialResult = await generateChatResponse(sanitizedMessage, trimmedHistory);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chatSession: any = initialResult.chatSession;

    if (initialResult.text) {
      finalText = initialResult.text;
    } else if (initialResult.functionCall) {
      currentFunctionCall = initialResult.functionCall;
    }

    // Function calling loop
    while (currentFunctionCall && iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      // Execute the tool
      const toolResult = await executeTool(currentFunctionCall.name, currentFunctionCall.args);

      // Collect products if any
      if (toolResult.products && toolResult.products.length > 0) {
        allProducts = [...allProducts, ...toolResult.products];
      }

      // Continue conversation with tool result (same chat session preserves thought signatures)
      const continuedResult = await continueWithToolResult(
        chatSession,
        currentFunctionCall,
        toolResult.result,
      );

      if (continuedResult.text) {
        finalText = continuedResult.text;
        currentFunctionCall = null; // Done
      } else if (continuedResult.functionCall) {
        currentFunctionCall = continuedResult.functionCall;
      } else {
        // Break if no text and no function call
        currentFunctionCall = null;
      }
    }

    // Safety fallback
    if (!finalText) {
      if (allProducts.length > 0) {
        finalText =
          'Berikut adalah rekomendasi paket wisata dan aktivitas terbaik di Bali yang kami pilihkan sesuai preferensi Anda. Anda dapat melihat detail paket langsung di bawah ini:';
      } else {
        finalText =
          'Maaf, layanan kami sedang mengalami lonjakan permintaan. Silakan ajukan pertanyaan kembali atau pilih paket melalui katalog kami.';
      }
    }

    // 7. Build response
    const response: ChatResponse = {
      reply: finalText,
      products: allProducts,
      session_id: currentSessionId,
    };

    // 8. Save conversation to DB
    await saveConversation(currentSessionId, sanitizedMessage, finalText, allProducts);

    // 9. Cache response (only for stateless queries)
    if (!history || history.length === 0) {
      await setCachedResponse(sanitizedMessage, response);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);

    // Check if it's a Gemini API error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Konfigurasi AI sedang bermasalah. Hubungi admin.' },
        { status: 500 },
      );
    }

    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'Layanan AI sedang sibuk. Coba lagi dalam beberapa saat.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan internal. Coba lagi nanti.' },
      { status: 500 },
    );
  }
}

// ---- Helper: Load conversation history from DB ----
async function loadConversationHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const supabase = getServerSupabaseClient();
    const { data } = await supabase
      .from('conversations')
      .select('messages')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any;
    return (row?.messages as ChatMessage[]) || [];
  } catch {
    return [];
  }
}

// ---- Helper: Save conversation to DB ----
async function saveConversation(
  sessionId: string,
  userMessage: string,
  botReply: string,
  products: ProductCard[],
): Promise<void> {
  try {
    const supabase = getServerSupabaseClient();
    const now = new Date().toISOString();

    // Try to load existing conversation
    const { data: rawData } = await supabase
      .from('conversations')
      .select('id, messages, message_count')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = rawData as any;

    const newMessages: ChatMessage[] = [
      { role: 'user', content: userMessage, timestamp: now },
      { role: 'assistant', content: botReply, products: products.length > 0 ? products : undefined, timestamp: now },
    ];

    if (existing) {
      // Append to existing conversation
      const allMessages = [...((existing.messages as ChatMessage[]) || []), ...newMessages];
      await supabase
        .from('conversations')
        .update({
          messages: allMessages,
          message_count: (existing.message_count || 0) + 2,
          last_activity: now,
        } as Record<string, unknown>)
        .eq('id', existing.id);
    } else {
      // Create new conversation
      await supabase.from('conversations').insert({
        session_id: sessionId,
        messages: newMessages,
        message_count: 2,
        last_activity: now,
        metadata: {},
      } as Record<string, unknown>);
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
    // Don't throw — saving conversation is not critical
  }
}

