<div align="center">
  <h1>PromptPrep</h1>
  <p><b>An AI-Powered Contextual Study Platform</b></p>
  <p><i>Intelligent Document Parsing, Semantic Vector Search, and Automated Knowledge Assessment</i></p>
  <br />
</div>

## Project Overview

PromptPrep is a comprehensive full-stack application designed to transform unstructured educational materials into structured, verifiable learning assets. By employing Retrieval-Augmented Generation (RAG) through advanced Large Language Models, the system seamlessly converts static PDFs and text files into dynamic quizzes, interactive flashcards, and highly contextual chat sessions.

## Core Capabilities

- **Document Ingestion Engine**: Automatically parses, semantic-chunks, and indexes unstructured textual data.
- **Automated Assessment Generation**: Synthesizes multiple-choice questions with dynamic difficulty scaling, performance tracking, and detailed explanations.
- **Intelligent Flashcards**: Extracts core conceptual pairs (term and definition) for high-efficiency memory retention.
- **RAG-Powered Chat Interface**: Provides a natural language query interface strictly grounded in the user's uploaded repository.
- **Resilient AI Subsystem**: Built-in automatic failover architecture spanning Google Gemini and Groq API backends to ensure uninterrupted generation capabilities.

---

## Technical Architecture

The platform follows a decoupled, modular design pattern optimized for stateless cloud deployment.

```mermaid
graph TD
    Client[React + Vite Frontend]
    API[Express.js Node Backend]
    Router[Express Router]
    Service[Business Logic Services]
    Repo[Prisma Repository Layer]
    DB[(Supabase PostgreSQL)]
    LLM{Gemini / Groq LLMs}

    Client -->|REST API| API
    API --> Router
    Router --> Service
    Service -->|O/R Mapping| Repo
    Service -->|Contextual Prompting| LLM
    Repo -->|Relational Data & pgvector| DB
```

### Applied Design Patterns

*   **Strategy Pattern**: Dynamically selects parsing algorithms (`PDFParser`, `TextParser`) based on MIME types.
*   **Factory Method**: Centralizes instantiation logic for parsers and AI generators (`ParserFactory`, `GeneratorFactory`).
*   **Template Method**: Standardizes the LLM pipeline (build prompt, invoke provider, parse response) while allowing subclass specialization (`BaseContentGenerator`).
*   **Repository Pattern**: Isolates abstract database operations from core business logic (`BaseRepository`).

### Technology Stack

| Layer | Component |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Vanilla CSS |
| **Backend API** | Node.js, Express.js, TypeScript |
| **Database ORM** | Prisma |
| **Relational Storage** | Supabase (PostgreSQL) |
| **Vector Engine** | Supabase `pgvector` |
| **AI Providers** | Google Gemini (Primary), Groq LLaMA (Fallback) |

---

## Deployment & Setup

This repository is configured for 100% cloud-native deployment. The storage tier utilizes Supabase, while the runtime backend is fully stateless.

### 1. Environment Configuration

Clone the repository and prepare the backend environment.

```bash
git clone https://github.com/AyushCoder9/PromptPrep.git
cd PromptPrep/backend
cp .env.example .env
```

Populate the following variables inside `.env`:
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
GEMINI_API_KEY="your_api_key"
GROQ_API_KEY="your_api_key_optional"
```

### 2. Initialization

Install dependencies and generate the Prisma client mappings.

```bash
# Backend Setup
npm install
npx prisma generate

# Frontend Setup
cd ../frontend
npm install
```

### 3. Execution

Launch both servers locally.

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

*   **API Server**: `http://localhost:3001`
*   **Application Interface**: `http://localhost:5173`

---

## API Documentation Reference

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service availability check |
| `POST` | `/api/documents/upload` | Injest, chunk, and embed target document |
| `GET` | `/api/documents` | Retrieve all parsed materials |
| `POST` | `/api/quizzes/generate` | Synthesize MCQ evaluation |
| `POST` | `/api/quizzes/:id/submit` | Evaluate and score submitted answers |
| `POST` | `/api/flashcards/generate` | Synthesize memory review cards |
| `POST` | `/api/qa/ask` | Contextual RAG query invocation |
