# Prompt Prep | Precision Study Ecosystem

![Prompt Prep Banner](https://readme-typing-svg.demolab.com?font=Montserrat&size=45&pause=1000&color=FF4D4D&center=true&vCenter=true&width=1000&height=100&lines=PROMPT+PREP;INTELLIGENT+KNOWLEDGE+ENGINE;SEMANTIC+STUDY+ORCHESTRATOR)

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-263238?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

</div>

---

Prompt Prep is a custom-engineered full-stack platform designed to synthesize vast amounts of educational data into high-utility learning assets. By integrating vector-based similarity search with state-of-the-art language models, the system enables users to parse documents deeply, generate rigorous academic evaluations, and interact with their notes through a precisely grounded conversational layer.

## Core Capabilities

*   **Semantic Data Harmonization**: Multi-format document parsing (PDF, MD, TXT) with intelligent chunking tailored for high-precision retrieval.
*   **Grounded Conversational Intelligence**: A retrieval-augmented query layer that guarantees accuracy by sourcing responses directly from private datasets.
*   **Automated Knowledge Evaluation**: Dynamic synthesis of comprehensive MCQ sets with automated scoring and exhaustive reasoning explanations.
*   **Rapid-Recall Synthesis**: Algorithmic extraction of core concepts into structured flashcards for accelerated knowledge retention.
*   **Adaptive LLM Orchestration**: Dual-engine intelligence spanning Google Gemini and Groq, featuring real-time provider switching and resilience.

## Technical Architecture

The architecture leverages a high-concurrency Node.js environment coupled with a vectorized relational database to maintain low-latency response times during complex RAG operations.

```mermaid
graph TD
    UI[Interactive React Interface]
    Core[Node.js Orchestration layer]
    Logic[Service Architecture]
    Storage[(Supabase Hub)]
    Neural[Gemini & Groq Models]

    UI -->|API Requests| Core
    Core --> Logic
    Logic -->|Vector Indexing| Storage
    Logic -->|Semantic Context| Neural
```

### Engineered Architecture Patterns
- **Provider Strategy**: Decoupled AI interfaces allowing seamless transitions between different LLM backends.
- **Factory Orchestration**: Centralized management for content generation and document processing flows.
- **Entity Repository**: Robust data persistence model powered by Prisma ORM.

---

## Implementation Foundations

| Layer | Environment | Purpose |
| :--- | :--- | :--- |
| **Logic Engine** | Node.js / TypeScript | High-concurrency operations and type-safety |
| **UI Framework** | React 18 / Framer | Fluid interactions and state-driven design |
| **Data Hub** | Supabase (Postgres) | Relational storage and managed pooling |
| **Vector Engine** | pgvector | Semantic similarity and distance metrics |
| **Inference** | Google Gemini | Primary reasoning and contextual synthesis |

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
