PRD: Travel Customer Service Chatbot dengan Gemini API, RAG & Product Filtering
1. Executive Summary
Proyek ini membangun asisten customer service berbasis AI untuk jasa travel. Chatbot memanfaatkan Google Gemini API sebagai single provider untuk LLM (chat) dan embedding model, sehingga hanya diperlukan satu API key. Dengan arsitektur Supabase Edge Functions + PostgreSQL/pgvector, chatbot mampu:

Menjawab pertanyaan tentang destinasi, paket wisata, dan FAQ menggunakan RAG (vector search pada dokumen yang di-embed dengan Gemini Embedding).

Melakukan filtering produk terstruktur (berdasarkan harga, durasi, destinasi, minat) melalui function calling Gemini.

Menyajikan rekomendasi produk dalam bentuk kartu interaktif di landing page.

Solusi ini menekankan efisiensi biaya, keamanan, dan skalabilitas dengan memanfaatkan model hemat dan caching.

2. Problem Statement
Pengguna kesulitan memfilter paket wisata secara manual.

Informasi destinasi (deskripsi, tips, FAQ) tersebar dan tidak terintegrasi dalam satu percakapan.

Customer service manual tidak scalable.

Chatbot berbasis aturan tidak mampu memahami variasi bahasa natural.

3. Goals & Objectives
Goals
Menyediakan chatbot yang menjawab pertanyaan travel secara natural dan akurat.

Meningkatkan konversi dengan rekomendasi produk relevan dalam percakapan.

Mengurangi beban CS manusia untuk pertanyaan umum.

Menjaga biaya operasional rendah.

Objectives (terukur)
80% pertanyaan umum terjawab tanpa intervensi manusia.

Waktu respons < 3 detik (non-streaming).

Pengguna menemukan paket wisata dalam ≤ 3 pertukaran pesan.

Biaya per percakapan < Rp 300 (dengan Gemini Flash & embedding murah).

4. User Personas
Wisatawan Independen – mencari paket sesuai budget/minat, ingin cepat.

Calon Pelanggan – butuh informasi destinasi, fasilitas, syarat perjalanan.

Admin Travel – mengelola produk/konten, memastikan chatbot akurat.

5. Fitur Utama
5.1 Landing Page
Tema travel, responsif.

Menampilkan destinasi unggulan, paket populer.

Chat widget mengambang (floating).

5.2 Chatbot
Input teks, output teks + kartu produk.

RAG untuk informasi tidak terstruktur.

Function calling untuk query produk terstruktur.

Memory terbatas (riwayat percakapan per sesi).

Multi-giliran (follow-up).

Menolak topik di luar travel.

5.3 Backend
Seeding data produk (20-30 item) & dokumen pengetahuan.

Embedding otomatis dengan Gemini Embedding.

Rate limiting & caching.

6. Arsitektur Sistem dengan Gemini API
Komponen:

Frontend: Next.js / HTML+JS – landing page & chat widget.

Backend: Supabase Edge Functions (Deno).

Database: Supabase PostgreSQL + pgvector.

AI Provider: Google Gemini API (single API key).

Endpoint Gemini yang digunakan:

Chat/LLM: generateContent dengan dukungan functionDeclarations.

Embedding: embedContent dengan model text-embedding-004 (output 768 dimensi).

Diagram Alur:

text
User -> Chat Widget -> POST /chat -> Edge Function
  -> Rate limit check
  -> Cache check
  -> Gemini generateContent (system prompt + history + tools)
     -> (jika ada functionCall) 
        -> search_products (SQL query) 
        -> search_knowledge (vector search)
     -> Gemini generateContent lagi dengan hasil tool
  -> Response { reply, products }
7. Data Model (Disesuaikan untuk Gemini Embedding)
7.1 Tabel products
Kolom	Tipe	Deskripsi
id	uuid	Primary key
name	text	Nama paket
category	text	'paket_wisata', 'hotel', 'transport'
destination	text	Nama destinasi
price	numeric	Harga IDR
duration_days	int	Durasi
highlights	text[]	Array minat (pantai, budaya, dll)
description	text	Deskripsi lengkap
image_url	text	URL gambar
created_at	timestamptz	Timestamp
7.2 Tabel documents
Kolom	Tipe	Deskripsi
id	bigserial	Primary key
content	text	Potongan teks
metadata	jsonb	{product_id, source, category}
embedding	vector(768)	Embedding dari Gemini Embedding
Indeks: ivfflat (cosine) atau hnsw.

7.3 Tabel conversations
Kolom	Tipe	Deskripsi
id	uuid	Primary key
session_id	uuid	ID sesi
user_id	uuid	Nullable
messages	jsonb	[{role, content, timestamp}]
created_at	timestamptz	
7.4 Tabel rate_limits
Kolom	Tipe	Deskripsi
key	text	Primary key (IP/session)
count	int	Jumlah request dalam window
window_start	timestamptz	Awal window
7.5 Tabel cache
Kolom	Tipe	Deskripsi
key	text	Hash input
response	jsonb	Respons tersimpan
expires_at	timestamptz	Waktu kedaluwarsa
8. API Design
8.1 POST /chat
Auth: Tidak wajib, rate limiting per IP/session.

Request Body:

json
{
  "message": "Saya mau liburan ke Bali budget 4 juta 3 hari suka pantai",
  "session_id": "optional-uuid",
  "history": [] // opsional, kalau client tidak menyimpan
}
Response:

json
{
  "reply": "Berikut paket yang cocok: ...",
  "products": [
    {
      "id": "uuid",
      "name": "Paket Bali Snorkeling 3 Hari",
      "price": 3500000,
      "image_url": "https://...",
      "destination": "Bali",
      "duration_days": 3
    }
  ]
}
8.2 POST /embed (internal/admin)
Auth: Service role key.

Request:

json
{
  "texts": ["deskripsi destinasi", "FAQ"],
  "metadata": {}
}
Response: { "success": true, "count": 2 }

8.3 GET /health
Mengecek status fungsi.

9. Detail Integrasi Gemini API dalam Edge Function
9.1 Setup
Install package @google/generative-ai di Deno atau gunakan fetch langsung ke REST API.

Simpan GEMINI_API_KEY sebagai environment variable.

9.2 Model Chat
Gunakan model gemini-1.5-flash (cepat & murah) atau gemini-1.5-pro jika butuh akurasi tinggi.

Konfigurasi parameter:

temperature: 0.3 (untuk jawaban faktual) atau 0.7 (lebih kreatif).

maxOutputTokens: 500.

topP: 0.9.

9.3 Function Calling dengan Gemini
Gemini menggunakan functionDeclarations dalam request. Contoh deklarasi:

json
{
  "functionDeclarations": [
    {
      "name": "search_products",
      "description": "Cari paket wisata berdasarkan filter",
      "parameters": {
        "type": "object",
        "properties": {
          "destination": {"type": "string", "description": "Nama destinasi, misal 'Bali'"},
          "max_price": {"type": "number", "description": "Harga maksimum dalam IDR"},
          "min_duration": {"type": "integer"},
          "max_duration": {"type": "integer"},
          "interests": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["destination"]
      }
    },
    {
      "name": "search_knowledge",
      "description": "Cari informasi umum tentang destinasi atau topik travel",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {"type": "string", "description": "Pertanyaan atau topik"}
        },
        "required": ["query"]
      }
    }
  ]
}
Alur eksekusi:

Kirim pesan user + deklarasi fungsi.

Gemini merespons dengan functionCall (berisi name dan args) atau teks biasa.

Jika ada functionCall, jalankan fungsi yang sesuai:

search_products: query SQL ke Supabase.

search_knowledge: embedding query → vector search.

Kirim kembali hasil tool sebagai functionResponse ke Gemini untuk menghasilkan jawaban final.

Contoh request ke Gemini (via REST):

http
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=API_KEY
Content-Type: application/json

{
  "contents": [
    {"role": "user", "parts": [{"text": "Saya mau ke Bali budget 4 juta"}]}
  ],
  "tools": [{"functionDeclarations": [...]}]
}
Respons dengan function call:

json
{
  "candidates": [{
    "content": {
      "parts": [
        {
          "functionCall": {
            "name": "search_products",
            "args": {
              "destination": "Bali",
              "max_price": 4000000
            }
          }
        }
      ]
    }
  }]
}
Setelah tool dieksekusi, kirim balik:

json
{
  "contents": [
    {"role": "user", "parts": [{"text": "Saya mau ke Bali budget 4 juta"}]},
    {
      "role": "model",
      "parts": [{"functionCall": {"name": "search_products", "args": {...}}}]
    },
    {
      "role": "tool",
      "parts": [{"functionResponse": {"name": "search_products", "response": {"result": "..."}}}]
    }
  ],
  "tools": [{"functionDeclarations": [...]}]
}
9.4 Embedding dengan Gemini
Model: text-embedding-004 (output 768 dimensi).

Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=API_KEY

Request body:

json
{
  "content": {"parts": [{"text": "teks yang akan di-embed"}]}
}
Response:

json
{
  "embedding": {
    "values": [0.123, -0.456, ...] // 768 angka
  }
}
Simpan ke kolom embedding sebagai vektor.

9.5 Rate Limiting & Biaya Gemini
Gemini API memiliki rate limit default: 60 permintaan per menit untuk model generative (free tier).

Untuk produksi, bisa upgrade ke pay-as-you-go.

Estimasi biaya (per 1 juta token):

gemini-1.5-flash: $0.075 / 1M input, $0.30 / 1M output.

text-embedding-004: $0.00025 / 1K karakter (sangat murah).

Dengan caching dan batasan token, biaya per percakapan sangat rendah.

10. Security Considerations
Rate Limiting di Edge Function (tabel rate_limits): 20 req/menit per IP/session.

Prompt Injection:

System prompt: "Anda adalah asisten travel. Hanya jawab pertanyaan seputar destinasi, paket wisata, dan informasi travel. Tolak pertanyaan di luar konteks."

Filter output: hapus konten berbahaya/script.

Input Validation:

Panjang pesan ≤ 500 karakter.

Tolak karakter kontrol.

CORS hanya domain frontend.

API Key disimpan di environment variable Edge Function.

Data Privacy: tidak menyimpan data pribadi sensitif.

11. Cost Optimization
Gunakan gemini-1.5-flash untuk chat, text-embedding-004 untuk embedding.

Batasi token: input konteks ≤ 2000 token, output ≤ 500 token.

Caching:

Hash pertanyaan → simpan jawaban 1 jam.

Cache hasil embedding untuk query yang sama.

Batch embedding saat seeding.

Pantau penggunaan token per request (log).

Estimasi biaya per percakapan:

1 panggilan awal (input ~300 token, output ~100 token) + 1 panggilan tool (input ~200, output ~100) + 1 panggilan final (input ~300, output ~200) ≈ total input 800 token, output 400 token.

Dengan harga Flash: ($0.075/1M * 800) + ($0.30/1M * 400) ≈ $0.00006 + $0.00012 = $0.00018 ≈ Rp 3. Sangat murah.

12. Metrics & Analytics
Jumlah percakapan/hari, rata-rata giliran, penggunaan tool.

Cache hit rate, latency, biaya per percakapan.

Feedback pengguna (opsional).

13. Milestones & Timeline
Fase	Deliverable	Waktu
1. Setup	Supabase project, tabel, seeding data	1 hari
2. Backend dasar	Edge function /chat tanpa tools	1 hari
3. RAG integration	Embedding dokumen, tool search_knowledge	1 hari
4. Product filtering	Tool search_products + integrasi	1 hari
5. Frontend	Landing page + chat widget	2 hari
6. Security & optimization	Rate limiting, caching, prompt hardening	1 hari
7. Testing & docs	Uji skenario, README, screenshot	2 hari
Total		~9 hari
14. Risks & Mitigations
Risiko	Mitigasi
Jawaban tidak akurat tentang produk	Gunakan function calling untuk data terstruktur, bukan RAG untuk angka. Sertakan disclaimer.
Biaya API	Caching, batasi token, gunakan model murah, pantau.
Prompt injection	Perkuat system prompt, validasi input/output.
Latency	Gunakan Flash, optimalkan prompt, pertimbangkan streaming (opsional).
Embedding tidak sinkron dengan produk baru	Jadwalkan re-embedding otomatis saat produk ditambah/update.
15. Acceptance Criteria
Chatbot menjawab pertanyaan destinasi dengan info relevan dari dokumen.

Chatbot merekomendasikan paket wisata berdasarkan budget, durasi, minat, dan menampilkan kartu produk.

Chatbot menangani pertanyaan lanjutan dalam satu sesi.

Rate limiting berfungsi.

Landing page responsif, chat widget berfungsi.

Dokumentasi lengkap (README, setup, screenshot).

16. Lampiran: Contoh System Prompt
text
Anda adalah asisten customer service untuk perusahaan travel "Nusantara Trip". 
Tugas Anda membantu pengguna menemukan paket wisata, menjawab pertanyaan tentang destinasi, dan memberikan rekomendasi.

Aturan:
- Jawab hanya dalam Bahasa Indonesia.
- Jika pengguna menanyakan paket wisata dengan kriteria (destinasi, budget, durasi, minat), gunakan fungsi search_products.
- Jika pengguna bertanya informasi umum tentang destinasi, tips, atau FAQ, gunakan fungsi search_knowledge.
- Jangan memberikan harga atau durasi dari ingatan; selalu gunakan tool.
- Jika tidak ada produk yang cocok, sampaikan dengan sopan dan tawarkan alternatif.
- Tolak pertanyaan di luar konteks travel dengan sopan.
- Jaga keramahan dan profesionalisme.
