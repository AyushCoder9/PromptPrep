import { VectorStoreManager } from "./VectorStoreManager";
import { Logger } from "../utils/logger";
import { config } from "../config/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { prisma } from "../repositories/BaseRepository";

/**
 * QAService — Business Logic Layer
 *
 * Handles context-aware Q&A ("Chat with your notes").
 * Uses RAG: Retrieve relevant chunks → Send to LLM with question → Return answer.
 */
export class QAService {
  private vectorStore: VectorStoreManager;
  private logger = new Logger("QAService");

  constructor() {
    this.vectorStore = VectorStoreManager.getInstance();
  }

  /**
   * Answer a question using document context (RAG).
   */
  async askQuestion(
    question: string,
    documentId?: string
  ): Promise<{ answer: string; sources: string[] }> {
    this.logger.info(`Processing question: "${question.substring(0, 50)}..."`);

    // 1. Retrieve relevant context
    let contextChunks = await this.vectorStore.similaritySearch(
      question,
      5,
      documentId
    );

    // Fallback: read raw chunks from SQLite if vector search returns empty
    if (contextChunks.length === 0 && documentId) {
      this.logger.warn(`Vector search returned empty for ${documentId}, reading chunks from SQLite`);
      const sqliteChunks = await (prisma as any).documentChunk.findMany({
        where: { documentId },
        orderBy: { chunkIndex: "asc" },
        take: 5,
      });
      contextChunks = sqliteChunks.map((c: { content: string }) => c.content);
    }

    if (contextChunks.length === 0) {
      return {
        answer: "I couldn't find any relevant information in the uploaded documents. Please upload study materials first.",
        sources: [],
      };
    }

    const context = contextChunks.join("\n\n---\n\n");

    // 2. Build prompt
    const prompt = `You are a helpful study assistant. Answer the student's question based ONLY on the provided study material. If the answer is not in the material, say so.

STUDY MATERIAL:
---
${context}
---

STUDENT'S QUESTION: ${question}

Provide a clear, educational answer. If relevant, include examples or explanations that aid understanding.`;

    // 3. Call LLM
    const answer = await this.callLLM(prompt);

    return {
      answer,
      sources: contextChunks.slice(0, 3).map((c) => c.substring(0, 150) + "..."),
    };
  }

  private async callLLM(prompt: string): Promise<string> {
    const { provider, apiKey } = config.getAvailableLLMProvider();

    if (provider === "gemini") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } else {
      const groq = new Groq({ apiKey });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 2048,
      });
      return completion.choices[0]?.message?.content || "Unable to generate an answer.";
    }
  }
}
