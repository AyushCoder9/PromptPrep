# ⚡ PromptPrep — AI-Powered Study Material Generator

> Transform static notes into interactive quizzes, flashcards, and chat-powered study sessions using RAG (Retrieval-Augmented Generation).

## 🎯 Features

- **📤 Document Ingestion** — Upload PDFs or text files; auto-parsed, chunked, and vector-indexed
- **📝 Quiz Generation** — AI-generated MCQs with difficulty levels, scoring, and explanations
- **🎴 Flashcard Engine** — Auto-generated term/definition flashcards with flip animations
- **💬 RAG Chat** — Chat with your notes; answers grounded in your uploaded documents
- **🎯 Interactive Demo** — Full walkthrough with sample ML content (no API key needed)
- **🔄 LLM Fallback System** — Automatic failover between Gemini and Groq APIs

## 🏗️ Architecture

```
Frontend (React + Vite + TypeScript)
        ↓ REST API
Backend (Express.js + TypeScript)
  ├── Controllers → Services → Repositories
  ├── Prisma ORM → SQLite
  ├── ChromaDB → Vector Embeddings
  └── Gemini / Groq → LLM Generation
```

### Design Patterns Used

| Pattern | Where | Purpose |
|---------|-------|---------|
| **Strategy** | `IDocumentParser` → `PDFParser`, `TextParser` | Interchangeable file parsers |
| **Factory Method** | `ParserFactory`, `GeneratorFactory` | Centralized object creation |
| **Template Method** | `BaseContentGenerator` (abstract) | Shared LLM flow, custom prompts |
| **Singleton** | `VectorStoreManager`, `EnvConfig` | Single DB connection |
| **Repository** | `BaseRepository<T>` | Decoupled data access |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | TypeScript, Express.js, Node.js |
| Database | SQLite (via Prisma ORM) |
| Vector Store | ChromaDB (Docker) |
| AI/LLM | Google Gemini API, Groq API |
| Frontend | React, Vite, TypeScript |
| Styling | Vanilla CSS (dark premium theme) |

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Docker (for ChromaDB)
- A Gemini or Groq API key

### 1. Clone & Install

```bash
git clone https://github.com/AyushCoder9/PromptPrep.git
cd PromptPrep

# Backend
cd backend
cp .env.example .env        # ← Add your API key here
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push

# Frontend
cd ../frontend
npm install
```

### 2. Start ChromaDB (Docker)

```bash
docker run -d -p 8000:8000 chromadb/chroma
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:5173

## 📁 Project Structure

```
PromptPrep/
├── idea.md                    # Project idea
├── useCaseDiagram.md          # Use Case Diagram (Mermaid)
├── sequenceDiagram.md         # Sequence Diagram (Mermaid)
├── classDiagram.md            # Class Diagram (Mermaid)
├── ErDiagram.md               # ER Diagram (Mermaid)
├── backend/
│   ├── src/
│   │   ├── interfaces/        # OOP Contracts
│   │   ├── parsers/           # Strategy Pattern
│   │   ├── generators/        # Factory + Template Method
│   │   ├── repositories/      # Repository Pattern
│   │   ├── services/          # Business Logic (incl. Singleton VectorStore)
│   │   ├── controllers/       # HTTP Layer
│   │   ├── routes/            # Express Routes
│   │   └── middleware/        # Error Handling
│   └── prisma/                # Database Schema
└── frontend/
    └── src/
        ├── pages/             # Dashboard, Upload, Quiz, Flashcards, Chat, Demo
        ├── components/        # Sidebar
        └── api/               # API Client
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/documents/upload` | Upload & process document |
| `GET` | `/api/documents` | List all documents |
| `POST` | `/api/quizzes/generate` | Generate quiz from document |
| `POST` | `/api/quizzes/:id/submit` | Submit quiz answers |
| `POST` | `/api/flashcards/generate` | Generate flashcards |
| `POST` | `/api/qa/ask` | Ask a question (RAG) |

## 👥 Team

**Ayush Kumar Singh** — Full Stack Developer  
B.Tech CSE, SRM Institute of Science and Technology
