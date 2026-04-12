# PromptPrep — AI-Powered Study Material Generator

## Problem
Students drown in unstructured PDFs and lecture notes. They lack the tools to quickly test their understanding or create structured review materials, leading to passive reading instead of active learning.

## Solution
PromptPrep is a full-stack application that ingests educational documents (PDFs, text files), indexes them using **RAG (Retrieval-Augmented Generation)**, and provides three AI-powered services:

1. **Context-Aware Q&A** — Chat with your notes using an AI assistant that retrieves relevant passages.
2. **Automated Quiz Generation** — Generate MCQ quizzes at varying difficulty levels from your materials.
3. **Flashcard Generation** — Auto-generate term/definition flashcards for efficient review.

## Key Features
- 📤 **Document Ingestion** — Upload PDFs or text files; automatically parsed, chunked, and indexed.
- 🔍 **Vector Search** — Semantic similarity search powered by ChromaDB and Google Gemini embeddings.
- 📝 **Quiz Engine** — AI-generated MCQs with explanations and scoring.
- 🎴 **Flashcard API** — Auto-generated term/definition flash cards.
- 💬 **RAG Chat** — Ask questions and get answers grounded in your documents.
- 🎯 **Interactive Demo** — Try the full workflow without uploading a real document.
- 🔄 **LLM Fallback System** — Supports Gemini and Groq API keys with automatic failover.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | TypeScript, Node.js, Express.js |
| **ORM** | Prisma (SQLite) |
| **Vector Store** | ChromaDB (Docker) |
| **AI/LLM** | Google Gemini API, Groq API (fallback) |
| **Framework** | LangChain.js-compatible architecture |
| **Frontend** | React, Vite, TypeScript |
| **Styling** | Vanilla CSS (premium dark theme) |

## Design Patterns

| Pattern | Implementation |
|---------|---------------|
| **Strategy** | `IDocumentParser` → `PDFParser`, `TextParser` |
| **Factory Method** | `ParserFactory`, `GeneratorFactory` |
| **Template Method** | `BaseContentGenerator` (abstract class) |
| **Singleton** | `VectorStoreManager`, `EnvConfig` |
| **Repository** | `BaseRepository<T>` → concrete repos |

## Architecture
```
Controllers → Services → Repositories → Database (Prisma/SQLite)
                ↓
          VectorStoreManager (ChromaDB)
                ↓
          LLM (Gemini / Groq fallback)
```
