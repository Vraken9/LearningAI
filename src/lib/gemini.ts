// ============================================
// Radha Bali - Gemini AI Client
// Wrapper for Google Generative AI SDK
// ============================================

import { GoogleGenerativeAI, SchemaType, type GenerateContentRequest, type Content, type Part } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './prompts';
import type { ChatMessage, GeminiFunctionCall } from './types';

// Initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Tool declarations for function calling
export const toolDeclarations = [
  {
    name: 'search_products',
    description:
      'Cari paket wisata, hotel, transport, atau aktivitas berdasarkan filter. Gunakan ini setiap kali user bertanya tentang produk, paket, harga, atau rekomendasi.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "Kata kunci spesifik aktivitas/pencarian, misal 'diving', 'snorkeling', 'freediving', 'sunset', 'trekking', 'pura'",
        },
        destination: {
          type: SchemaType.STRING,
          description: "Nama destinasi spesifik (misal 'Amed', 'Ubud', 'Nusa Penida', 'Menjangan', 'Kintamani'). Kosongkan atau abaikan jika user hanya menyebut Bali secara umum.",
        },
        region: {
          type: SchemaType.STRING,
          description: "Region wisata, misal 'Bali'",
        },
        min_price: {
          type: SchemaType.NUMBER,
          description: 'Harga minimum dalam IDR',
        },
        max_price: {
          type: SchemaType.NUMBER,
          description: 'Harga maksimum dalam IDR',
        },
        min_duration: {
          type: SchemaType.INTEGER,
          description: 'Durasi minimum dalam hari',
        },
        max_duration: {
          type: SchemaType.INTEGER,
          description: 'Durasi maksimum dalam hari',
        },
        interests: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description:
            "Array minat/aktivitas, misal ['pantai', 'snorkeling', 'budaya', 'adventure', 'kuliner', 'spa', 'diving', 'surfing', 'fotografi', 'relax', 'romantic', 'keluarga']",
        },
        category: {
          type: SchemaType.STRING,
          enum: ['paket_wisata', 'hotel', 'transport', 'aktivitas'],
          description: 'Kategori produk',
        },
        sort_by: {
          type: SchemaType.STRING,
          enum: ['price_asc', 'price_desc', 'rating', 'duration'],
          description: 'Urutan hasil pencarian',
        },
        limit: {
          type: SchemaType.INTEGER,
          description: 'Maksimum jumlah hasil (default 5)',
        },
      },
    },
  },
  {
    name: 'search_knowledge',
    description:
      'Cari informasi umum tentang destinasi, tips perjalanan, FAQ, kebijakan, atau topik travel lainnya. Gunakan ini untuk pertanyaan informatif yang bukan tentang produk spesifik.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: 'Pertanyaan atau topik yang dicari, misal "tips ke Bali", "cuaca Ubud", "kebijakan pembatalan"',
        },
        source_type: {
          type: SchemaType.STRING,
          enum: ['faq', 'guide', 'policy', 'description', 'tips'],
          description: 'Filter berdasarkan tipe sumber',
        },
        limit: {
          type: SchemaType.INTEGER,
          description: 'Maksimum jumlah hasil (default 3)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_product_detail',
    description: 'Ambil detail lengkap satu paket wisata/produk tertentu berdasarkan nama.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        product_name: {
          type: SchemaType.STRING,
          description: 'Nama produk yang ingin dilihat detailnya',
        },
      },
      required: ['product_name'],
    },
  },
];

// Convert chat history to Gemini format
function chatHistoryToGeminiContents(history: ChatMessage[]): Content[] {
  return history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }] as Part[],
  }));
}

const CHAT_MODELS = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.6-flash'];

// Generate chat response with model fallback
export async function generateChatResponse(
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<{ text: string | null; functionCall: GeminiFunctionCall | null; chatSession: any }> {
  const genAI = getGeminiClient();
  let lastError: any = null;

  for (const modelName of CHAT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
          topP: 0.9,
        },
        tools: [
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            functionDeclarations: toolDeclarations as any,
          },
        ],
      });

      const contents: Content[] = [
        ...chatHistoryToGeminiContents(history),
        {
          role: 'user',
          parts: [{ text: userMessage }] as Part[],
        },
      ];

      const result = await model.generateContent({ contents });
      const response = result.response;
      const candidate = response.candidates?.[0];

      if (!candidate?.content?.parts) {
        continue;
      }

      // Check for function call
      for (const part of candidate.content.parts) {
        if (part.functionCall) {
          // Append candidate content to preserve conversation flow & thought signature
          contents.push(candidate.content);
          return {
            text: null,
            functionCall: {
              name: part.functionCall.name,
              args: part.functionCall.args as Record<string, unknown>,
            },
            chatSession: { model, contents, modelName },
          };
        }
      }

      // Return text response
      const text = candidate.content.parts.map((p: any) => p.text || '').join('');
      contents.push(candidate.content);
      return { text, functionCall: null, chatSession: { model, contents, modelName } };
    } catch (err: any) {
      console.warn(`Model ${modelName} encountered error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Semua model AI sedang sibuk. Silakan coba sesaat lagi.');
}

// Continue conversation after function call result
// Passes functionResponse with role: 'user' to ensure compatibility with Gemini endpoints
export async function continueWithToolResult(
  chatSession: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  functionCall: GeminiFunctionCall,
  toolResult: unknown,
): Promise<{ text: string | null; functionCall: GeminiFunctionCall | null }> {
  try {
    // Standard contents-based session
    if (chatSession && chatSession.contents && chatSession.model) {
      chatSession.contents.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: functionCall.name,
              response: { result: toolResult },
            },
          },
        ],
      });

      const result = await chatSession.model.generateContent({ contents: chatSession.contents });
      const response = result.response;
      const candidate = response.candidates?.[0];

      if (!candidate?.content?.parts) {
        return { text: null, functionCall: null };
      }

      chatSession.contents.push(candidate.content);

      // Check for another function call (chained tools)
      for (const part of candidate.content.parts) {
        if (part.functionCall) {
          return {
            text: null,
            functionCall: {
              name: part.functionCall.name,
              args: part.functionCall.args as Record<string, unknown>,
            },
          };
        }
      }

      const text = candidate.content.parts.map((p: any) => p.text || '').join('');
      return { text, functionCall: null };
    }

    // Fallback if legacy chatSession is provided
    if (chatSession && typeof chatSession.sendMessage === 'function') {
      const result = await chatSession.sendMessage([
        {
          functionResponse: {
            name: functionCall.name,
            response: { result: toolResult },
          },
        },
      ]);

      const response = result.response;
      const candidate = response.candidates?.[0];

      if (!candidate?.content?.parts) {
        return { text: null, functionCall: null };
      }

      for (const part of candidate.content.parts) {
        if (part.functionCall) {
          return {
            text: null,
            functionCall: {
              name: part.functionCall.name,
              args: part.functionCall.args as Record<string, unknown>,
            },
          };
        }
      }

      const text = candidate.content.parts.map((p: any) => p.text || '').join('');
      return { text, functionCall: null };
    }

    return { text: null, functionCall: null };
  } catch (err: any) {
    console.warn('continueWithToolResult error:', err?.message || err);
    return { text: null, functionCall: null };
  }
}

// Generate embeddings using Gemini
// Using outputDimensionality: 768 to stay within HNSW index limit (max 2000)
export async function generateEmbedding(text: string): Promise<number[]> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  return result.embedding.values;
}

// Batch generate embeddings
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((text) => generateEmbedding(text)));
    embeddings.push(...batchResults);

    // Small delay between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return embeddings;
}
