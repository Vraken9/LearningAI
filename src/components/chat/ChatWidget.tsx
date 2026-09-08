'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, ProductCard, ChatResponse } from '@/lib/types';
import {
  Compass,
  MessageSquare,
  Sparkles,
  X,
  SendHorizontal,
  MapPin,
  Clock,
  Star,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================
// Radha Bali - Chat Widget Component
// Supabase-styled AI Travel Intelligence Assistant
// Zero emojis, crisp typography, clean card layout
// ============================================

// No longer needed, using LanguageContext formatCurrency
// function formatPrice(price: number): string {
//   return new Intl.NumberFormat('id-ID', {
//     style: 'currency',
//     currency: 'IDR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(price);
// }

// Simple markdown to HTML converter for bot messages
function renderMarkdown(text: string): string {
  return text
    // Markdown links: [Title](url) -> <a href="url" class="chat-text-link">Title</a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="chat-text-link" target="_self">$1</a>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Bullet points
    .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*?<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Line breaks
    .replace(/\n/g, '<br/>');
}

// Welcome message (professional, concise, zero emojis)
const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Selamat datang di Radha Bali. Saya **Nusa AI**, asisten spesialis perjalanan Anda.\n\nLayanan yang dapat saya bantu:\n- Rekomendasi paket wisata sesuai anggaran dan preferensi\n- Informasi destinasi, durasi, dan rencana rute perjalanan\n- Panduan aktivitas, budaya, dan akomodasi di seluruh Bali\n\nSilakan sampaikan rencana perjalanan Anda.',
  timestamp: new Date().toISOString(),
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { formatCurrency, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radha_session_id');
      if (stored) return stored;
      const newId = crypto.randomUUID();
      localStorage.setItem('radha_session_id', newId);
      return newId;
    }
    return crypto.randomUUID();
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Listen for openChat custom event from landing page CTA buttons
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Send message
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId,
          history: messages.filter((m) => m.role !== 'assistant' || messages.indexOf(m) !== 0), // exclude welcome msg
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = (await response.json()) as ChatResponse;

      const botMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        products: data.products?.length > 0 ? data.products : undefined,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Terjadi kesalahan teknis';

      const errorBotMessage: ChatMessage = {
        role: 'assistant',
        content: `Maaf, terjadi kendala saat memproses permintaan: ${errorMessage}. Silakan coba ajukan pertanyaan kembali.`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ---- Render Floating Launcher ----
  if (!isOpen) {
    return (
      <button
        className="chat-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open Nusa AI Chat Assistant"
        id="chat-fab-button"
      >
        <span className="chat-fab-pulse" />
        <Sparkles className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <div className="chat-panel" id="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            <Bot className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="chat-header-name">
              <span>Nusa AI</span>
              <span className="badge" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                Online
              </span>
            </div>
            <div className="chat-header-status">
              <span className="chat-header-status-dot" />
              <span>Travel Concierge</span>
            </div>
          </div>
        </div>

        <button
          className="chat-header-close"
          onClick={() => setIsOpen(false)}
          aria-label="Tutup jendela chat"
          id="chat-close-button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages" id="chat-messages">
        {messages.map((msg, index) => (
          <div key={index}>
            {/* Message Bubble */}
            <div
              className={`chat-bubble ${
                msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(msg.content),
                  }}
                />
              ) : (
                msg.content
              )}
            </div>

            {/* Product Cards Carousel in Chat */}
            {msg.products && msg.products.length > 0 && (
              <div className="chat-products">
                {msg.products.map((product: ProductCard) => (
                  <ProductCardComponent key={product.id} product={product} formatCurrency={formatCurrency} language={language} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar (Supabase Command Palette Style) */}
      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Tanyakan rekomendasi wisata, budget, atau durasi..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={500}
          id="chat-input"
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          aria-label="Kirim pesan"
          id="chat-send-button"
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ---- Product Card Sub-component ----
function ProductCardComponent({ product, formatCurrency, language }: { product: ProductCard, formatCurrency: (price: number) => string, language: string }) {
  return (
    <a
      href={`/products/${product.slug}`}
      className="chat-product-card"
      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', cursor: 'pointer' }}
      title={`Lihat detail paket ${product.name}`}
    >
      {product.image_url && (
        <div className="chat-product-image">
          <img src={product.image_url} alt={product.name} loading="lazy" />
        </div>
      )}
      <div className="chat-product-body">
        <div className="chat-product-name">{product.name}</div>
        <div className="chat-product-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <MapPin className="w-2.5 h-2.5" style={{ color: '#00959c' }} />
            <span>{product.destination}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span>{product.duration_days}D</span>
          </span>
          {product.rating > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </span>
          )}
        </div>
        <div className="chat-product-price">
          {formatCurrency(product.price)}
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 400,
              color: 'var(--color-text-muted)',
              marginLeft: '4px',
            }}
          >
            {product.price_per_person ? (language === 'en' ? '/person' : '/org') : (language === 'en' ? '/package' : '/paket')}
          </span>
        </div>
        <div className="chat-product-btn">
          <span>Lihat Detail Paket</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </a>
  );
}
