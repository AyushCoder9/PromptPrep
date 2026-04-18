# Prompt Prep | AI-Powered Document Intelligence

![Prompt Prep Banner](https://readme-typing-svg.demolab.com?font=Fira+Code&size=45&pause=1000&color=3B82F6&center=true&vCenter=true&width=1000&height=100&lines=PROMPT+PREP;AI+STUDY+COMPANION;NEURAL+KNOWLEDGE+EXTRACTION)

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-263238?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

</div>

---

Prompt Prep is a sophisticated Full-Stack application designed to transform static educational documents into interactive, conversational learning environments. By leveraging Retrieval-Augmented Generation (RAG) and high-fidelity Large Language Models, it provides deep document analysis, automated assessment generation, and context-grounded intelligence.

## Core Capabilities

*   **Neural Document Ingestion**: Advanced parsing and semantic chunking of PDFs and text files, optimized for vector indexing.
*   **Contextual RAG Chat**: A natural language interface strictly grounded in your library—eliminating AI hallucinations.
*   **Automated Knowledge Assessments**: Synthesize multiple-choice quizzes with detailed explanations and dynamic difficulty.
*   **High-Fidelity Flashcards**: Automatic extraction of atomic concepts (Term/Definition) for high-efficiency memory retention.
*   **Resilient AI Pipeline**: Dual-engine architecture with automatic fallback between Google Gemini and Groq (LLaMA 3).

## Technical Architecture

The platform is built on a modular, stateless architecture designed for high throughput and precision retrieval.

```mermaid
graph TD
    Client[React + Framer Motion]
    API[Express.js Node Backend]
    Service[Service Layer]
    Vector[Semantic Search Engine]
    DB[(Supabase PostgreSQL)]
    LLM{Gemini / Groq LLMs}

    Client -->|REST API| API
    API --> Service
    Service -->|Contextual Retrieval| Vector
    Service -->|Knowledge Generation| LLM
    Vector -->|pgvector Query| DB
```

### Modular Design Systems
- **Strategy Pattern**: Dynamic parsing selection based on file heuristics.
- **Factory Pattern**: Centralized orchestration for AI generation modules.
- **Repository Pattern**: Abstracted data access layer using Prisma ORM.

---

## Implementation Stack

| Layer | Technology | Utility |
| :--- | :--- | :--- |
| **Runtime** | Node.js | Asynchronous backend execution |
| **Frontend** | React 18 | Declarative UI and state management |
| **Logic** | TypeScript | Type-safe development across the stack |
| **Database** | Supabase | Relational data and transactional pooling |
| **Vectors** | pgvector | High-performance semantic similarity search |
| **Generative AI**| Google Gemini | Core reasoning and content synthesis |

---

## Quick Start

### 1. Project Initialization
```bash
git clone https://github.com/AyushCoder9/PromptPrep.git
cd PromptPrep/backend
cp .env.example .env
```

### 2. Environment Configuration
Populate your `.env` with the following:
```env
DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-0-[reg].pooler.supabase.com:6543/postgres?pgbouncer=true"
GEMINI_API_KEY="your_api_key"
GROQ_API_KEY="your_api_key_optional"
```

### 3. Execution
```bash
# In /backend
npm install && npx prisma generate
npm run dev

# In /frontend (separate terminal)
npm install
npm run dev
```

---

## API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/documents/upload` | `POST` | Semantic ingestion and vectorization |
| `/api/quizzes/generate` | `POST` | AI-driven assessment synthesis |
| `/api/flashcards/generate` | `POST` | Conceptual term extraction |
| `/api/qa/ask` | `POST` | Grounded RAG query invocation |

---

<div align="center">
  <p>Built with precision for the modern learner.</p>
</div>
