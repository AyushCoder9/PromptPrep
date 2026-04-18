import { config } from "../config/env";
import { Logger } from "../utils/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../repositories/BaseRepository";
import { memoryStore } from "./InMemoryStore";

export class VectorStoreManager {
  private static instance: VectorStoreManager;
  private logger = new Logger("VectorStoreManager");
  private initialized = false;

  private constructor() {}

  public static getInstance(): VectorStoreManager {
    if (!VectorStoreManager.instance) {
      VectorStoreManager.instance = new VectorStoreManager();
    }
    return VectorStoreManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    this.logger.info("PgVector SQL layer initialized");
  }

  public async addDocuments(
    chunks: string[],
    metadata: { documentId: string; title: string }
  ): Promise<void> {
    await this.ensureInitialized();
    const embeddings = await this.generateEmbeddings(chunks);

    // Always store embeddings in memory for resilience
    memoryStore.addEmbeddings(metadata.documentId, embeddings);

    try {
      // Parallelize DB updates for maximum performance on Vercel
      await Promise.all(
        chunks.map((_, i) => {
          const vectorStr = `[${embeddings[i].join(",")}]`;
          return prisma.$executeRawUnsafe(
            `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE "documentId" = $2 AND "chunkIndex" = $3`,
            vectorStr,
            metadata.documentId,
            i
          );
        })
      );
      this.logger.info(`Updated pgvector embeddings for ${chunks.length} chunks of document: ${metadata.title}`);
    } catch (error) {
      this.logger.warn("Supabase pgvector update failed. Embeddings are safe in memory for similarity search.");
    }
  }

  public async similaritySearch(
    query: string,
    topK: number = 5,
    documentId?: string
  ): Promise<string[]> {
    await this.ensureInitialized();
    const queryEmbedding = await this.generateEmbeddings([query]);
    const vectorStr = `[${queryEmbedding[0].join(",")}]`;

    // Try Supabase pgvector first
    try {
      let results: Array<{ content: string }>;
      
      if (documentId) {
        results = await prisma.$queryRawUnsafe<{ content: string }[]>(
          `SELECT content FROM "DocumentChunk" WHERE "documentId" = $1 ORDER BY embedding <-> $2::vector LIMIT $3`,
          documentId,
          vectorStr,
          topK
        );
      } else {
        results = await prisma.$queryRawUnsafe<{ content: string }[]>(
          `SELECT content FROM "DocumentChunk" ORDER BY embedding <-> $1::vector LIMIT $2`,
          vectorStr,
          topK
        );
      }

      if (results.length > 0) {
        return results.map(r => r.content);
      }
    } catch (error) {
      this.logger.warn("Supabase pgvector search failed. Falling back to in-memory similarity search.");
    }

    // Fallback: in-memory cosine similarity search
    const memResults = memoryStore.similaritySearch(queryEmbedding[0], topK, documentId);
    if (memResults.length > 0) {
      this.logger.info(`In-memory search returned ${memResults.length} results`);
      return memResults;
    }

    return [];
  }

  public async deleteDocument(documentId: string): Promise<void> {
     this.logger.info(`Vector lifecycle managed natively by Prisma for document: ${documentId}`);
  }

  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const { provider, apiKey } = config.getAvailableLLMProvider();

    if (provider === "gemini") {
      try {
        return await this.geminiEmbeddings(apiKey, texts);
      } catch (error) {
        this.logger.warn("Gemini embedding model failed or is unavailable. Falling back to simple heuristic embeddings.");
      }
    }
    
    return this.simpleEmbeddings(texts);
  }

  private async geminiEmbeddings(apiKey: string, texts: string[]): Promise<number[][]> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // Use batchEmbedContents to reduce latency from O(N) to O(1)
    const result = await model.batchEmbedContents({
      requests: texts.map((t) => ({
        content: { role: "user", parts: [{ text: t }] },
      })),
    });

    return result.embeddings.map((e) => e.values);
  }

  private async simpleEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map((text) => {
      const vec = new Array(768).fill(0);
      for (let i = 0; i < text.length; i++) {
        vec[text.charCodeAt(i) % 768] += 1;
      }
      
      const magnitude = Math.sqrt(vec.reduce((sum: number, v: number) => sum + v * v, 0));
      return magnitude > 0 ? vec.map((v: number) => v / magnitude) : vec;
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
