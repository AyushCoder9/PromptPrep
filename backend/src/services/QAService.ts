import { VectorStoreManager } from "./VectorStoreManager";
import { Logger } from "../utils/logger";
import { config } from "../config/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { prisma } from "../repositories/BaseRepository";
import { memoryStore } from "./InMemoryStore";

export class QAService {
  private vectorStore: VectorStoreManager;
  private logger = new Logger("QAService");

  constructor() {
    this.vectorStore = VectorStoreManager.getInstance();
  }

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

    // Fallback: read raw chunks from DB if vector search returns empty
    if (contextChunks.length === 0 && documentId) {
      this.logger.warn(`Vector search returned empty for ${documentId}, reading chunks from DB`);
      try {
        const dbChunks = await (prisma as any).documentChunk.findMany({
          where: { documentId },
          orderBy: { chunkIndex: "asc" },
          take: 5,
        });
        contextChunks = dbChunks.map((c: { content: string }) => c.content);
      } catch {
        this.logger.warn("DB unreachable, falling back to in-memory chunks");
        const memChunks = memoryStore.getChunks(documentId, 5);
        contextChunks = memChunks.map((c: any) => c.content);
      }
    }

    // Final fallback: in-memory store (all documents)
    if (contextChunks.length === 0 && !documentId) {
      const memChunks = memoryStore.getAllChunks(5);
      contextChunks = memChunks.map((c: any) => c.content);
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
    // Always try Gemini first if key is available
    if (config.geminiApiKey && config.geminiApiKey !== "your_gemini_api_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(config.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (geminiError: any) {
        this.logger.warn(`Gemini failed (${geminiError?.message?.substring(0, 80)}). Falling back to Groq...`);
      }
    }

    // Fallback to Groq
    if (config.groqApiKey && config.groqApiKey !== "your_groq_api_key_here") {
      try {
        const groq = new Groq({ apiKey: config.groqApiKey });
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
          max_tokens: 2048,
        });
        return completion.choices[0]?.message?.content || "Unable to generate an answer.";
      } catch (groqError: any) {
        this.logger.error(`Groq fallback also failed: ${groqError?.message}`);
        throw new Error("All AI providers are currently unavailable. Please try again in a moment.");
      }
    }

    throw new Error("No LLM API key configured. Please add GEMINI_API_KEY or GROQ_API_KEY.");
  }
}
