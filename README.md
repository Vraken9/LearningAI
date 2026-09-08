# 🌴 Radha Bali — AI-Powered Travel Platform

> Platform travel wisata Bali dengan chatbot AI personal yang membantu menemukan paket wisata terbaik.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-green?logo=supabase)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-purple?logo=google)

## ✨ Fitur

- **🤖 AI Chat Assistant** — "Nusa" chatbot yang memahami konteks wisata Bali
- **🔍 RAG (Retrieval-Augmented Generation)** — Jawaban berbasis data dengan pgvector
- **🛠️ Function Calling** — AI mencari produk & info secara real-time
- **📦 25+ Paket Wisata** — Database lengkap produk travel
- **📊 Admin Panel** — Dashboard, CRUD produk, knowledge base, conversation logs
- **⚡ Caching & Rate Limiting** — Performa optimal dan proteksi abuse
- **📱 Responsive Design** — Mobile-friendly dengan premium aesthetics

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| AI Model | Google Gemini 2.0 Flash |
| Embeddings | text-embedding-004 (768 dim) |
| Database | Supabase (PostgreSQL + pgvector) |
| Styling | Vanilla CSS (Design System) |
| Deployment | Vercel (free tier compatible) |

## 📁 Project Structure

```
├── scripts/
│   ├── setup-db.sql          # Database schema (run in Supabase SQL Editor)
│   └── seed.ts               # Seed data script
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout + SEO
│   │   ├── globals.css        # Design system
│   │   ├── admin/             # Admin panel
│   │   │   ├── page.tsx       # Dashboard, Products, Docs, Conversations
│   │   │   └── admin.css      # Admin styles
│   │   └── api/
│   │       ├── chat/          # POST - Chat with AI (function calling)
│   │       ├── embed/         # POST - Admin embed documents
│   │       ├── health/        # GET  - Health check
│   │       ├── products/      # GET  - Public products listing
│   │       └── admin/         # Admin CRUD APIs
│   ├── components/
│   │   ├── chat/ChatWidget.tsx  # Floating chat widget
│   │   └── ErrorBoundary.tsx    # Error boundary
│   ├── data/
│   │   ├── seed-products.ts   # 25+ product data
│   │   └── seed-knowledge.ts  # 20+ knowledge docs
│   └── lib/
│       ├── types.ts           # TypeScript interfaces
│       ├── supabase.ts        # Supabase client
│       ├── gemini.ts          # Gemini AI wrapper + function calling
│       ├── tools.ts           # Tool handlers (search, RAG)
│       ├── prompts.ts         # System prompt for AI
│       ├── rate-limit.ts      # Sliding window rate limiter
│       └── cache.ts           # SHA-256 response caching
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Setup Database

1. Open your Supabase project → **SQL Editor**
2. Copy and paste `scripts/setup-db.sql`
3. Run the SQL script

### 4. Seed Data

```bash
npx tsx scripts/seed.ts
```

### 5. Run Development Server

```bash
npm run dev
```

Visit:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Chat with AI (function calling + tool use) |
| `POST` | `/api/embed` | Admin: embed documents into vector DB |
| `GET` | `/api/health` | Health check (DB + Gemini status) |
| `GET` | `/api/products` | Public products listing (with filters) |
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET/POST/PUT/DELETE` | `/api/admin/products` | Product CRUD |
| `GET/POST/PUT/DELETE` | `/api/admin/documents` | Knowledge base CRUD |
| `GET` | `/api/admin/conversations` | Conversation list |
| `GET` | `/api/admin/conversations/[id]` | Conversation detail |

## 🤖 AI Architecture

```
User Message → Rate Limit → Cache Check
    ↓
Gemini 2.0 Flash (Function Calling)
    ↓
┌─────────────────────┐
│ search_products     │ → SQL query to Supabase
│ search_knowledge    │ → pgvector similarity search (RAG)
│ get_product_detail  │ → Single product lookup
└─────────────────────┘
    ↓
AI Response → Cache Store → Save Conversation → Return
```

## 🔐 Admin Authentication

Admin panel (`/admin`) dilindungi oleh otentikasi sederhana berbasis cookie. 
1. Akses `/admin`, Anda akan diarahkan ke `/login` jika belum terotentikasi.
2. Masukkan password admin (default: `admin123` jika tidak ada `ADMIN_PASSWORD` di environment variables).
3. Anda akan diarahkan ke dashboard setelah berhasil.

## 🚀 Deployment (Vercel)

Proyek ini telah dikonfigurasi untuk siap di-deploy ke Vercel tanpa pengaturan tambahan:
1. Push repository ini ke GitHub.
2. Buka dashboard Vercel, klik **Add New... > Project**.
3. Import repository GitHub ini.
4. Di bagian **Environment Variables**, tambahkan:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `ADMIN_PASSWORD` (opsional, untuk login admin yang aman)
5. Klik **Deploy**.

## 📝 License

This project is for learning purposes (pembelajaran).

---

Made with ❤️ for **Radha Bali**
