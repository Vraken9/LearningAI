<div align="center">

#  Gemini AI REST API

**Express.js API powered by Google Gemini for text generation & image analysis**

<br/>

<p align="center">
  <a href="https://www.ibm.com">
    <img src="https://img.shields.io/badge/IBM-052FAD?style=for-the-badge&logo=ibm&logoColor=white" alt="IBM" />
  </a>
  <a href="https://www.hacktiv8.com">
    <img src="https://img.shields.io/badge/Hacktiv8-FF6600?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABhSURBVDhPY/hPBGBkZPwPYxMDGBgZGf9D2cQCJig7GKoGDTBB2MEwNRA2E4gNVUPQOBAmKDuIdjPITJAmYgHY30Q7GqSJ6NCAaUI3k2A3Ew4NDAcjE8ihQbJxOEoDAA5HIU/3dqZJAAAAAElFTkSuQmCC&logoColor=white" alt="Hacktiv8" />
  </a>
  <a href="https://antigravity.google">
    <img src="https://img.shields.io/badge/Antigravity-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Antigravity" />
  </a>
  <a href="https://aistudio.google.com">
    <img src="https://img.shields.io/badge/Google%20AI%20Studio-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google AI Studio" />
  </a>
</p>

<br/>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_3.5_Flash_Lite-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

</div>

---

##  Deskripsi

REST API sederhana yang menggunakan **Google Gemini AI** (`gemini-3.5-flash-lite`) melalui `@google/genai` SDK. Proyek ini dibuat sebagai bagian dari pembelajaran **IBM SkillsBuild x Hacktiv8** menggunakan **Google Antigravity IDE** dan **Google AI Studio**.

##  Fitur

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/generate-text` | `POST` | Generate teks dari prompt |
| `/generate-from-image` | `POST` | Analisis gambar + prompt menggunakan AI |

##  Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Vraken9/LearningAI.git
cd LearningAI
npm install
```

### 2. Setup Environment

Buat file `.env` di root project:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

>  Dapatkan API Key di [Google AI Studio](https://aistudio.google.com/apikey)

### 3. Jalankan Server

```bash
npx nodemon index.js
```

Server berjalan di `http://localhost:3000`

## 📡 Contoh Request (Postman)

### Generate Text

```
POST /generate-text
Content-Type: application/json

{
  "prompt": "Jelaskan apa itu machine learning"
}
```

### Generate from Image

```
POST /generate-from-image
Content-Type: multipart/form-data

Key: image    → (File) upload gambar
Key: prompt   → (Text) "Jelaskan isi gambar ini"
```

## 🛠️ Tech Stack

- **Runtime** — Node.js
- **Framework** — Express 5
- **AI Model** — Gemini 3.5 Flash Lite
- **SDK** — @google/genai
- **Upload** — Multer

##  License

ISC © 2026

---

<div align="center">
  <sub>Built with  using <b>Google Antigravity IDE</b> • IBM SkillsBuild x Hacktiv8</sub>
</div>
