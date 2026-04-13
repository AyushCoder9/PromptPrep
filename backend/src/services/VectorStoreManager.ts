import { ChromaClient, Collection } from "chromadb";
import { config } from "../config/env";
import { Logger } from "../utils/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

/**
 * VectorStoreManager — Singleton Pattern
 *
 * Manages the ChromaDB vector store connection.
 * Provides methods for adding document chunks and performing similarity search.
 * Uses a single shared instance across the application.
 */
export class VectorStoreManager {
  private static instance: VectorStoreManager;
  private client: ChromaClient;
  private collection: Collection | null = null;
  private logger = new Logger("VectorStoreManager");
  private initialized = false;

  private constructor() {
    this.client = new ChromaClient({
      path: config.chromaHost,
    });
  }

  public static getInstance(): VectorStoreManager {
    if (!VectorStoreManager.instance) {
      VectorStoreManager.instance = new VectorStoreManager();
    }
    return VectorStoreManager.instance;
  }

  /**
   * Initialize the vector store collection.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.collection = await this.client.getOrCreateCollection({
        name: "promptprep_documents",
        metadata: { "hnsw:space": "cosine" },
      });
      this.initialized = true;
      this.logger.info("ChromaDB collection initialized");
    } catch (error) {
      this.logger.error("Failed to initialize ChromaDB", error);
      throw error;
    }
  }

  /**
   * Add document chunks to the vector store.
   */
  public async addDocuments(
    chunks: string[],
    metadata: { documentId: string; title: string }
  ): Promise<void> {
    await this.ensureInitialized();

    const embeddings = await this.generateEmbeddings(chunks);

    const ids = chunks.map((_, i) => `${metadata.documentId}_chunk_${i}`);
    const metadataArray = chunks.map((_, i) => ({
      documentId: metadata.documentId,
      title: metadata.title,
      chunkIndex: i,
    }));

    await this.collection!.add({
      ids,
      embeddings,
      documents: chunks,
      metadatas: metadataArray,
    });

    this.logger.info(`Added ${chunks.length} chunks for document: ${metadata.title}`);
  }

  /**
   * Perform similarity search against indexed documents.
   */
  public async similaritySearch(
    query: string,
    topK: number = 5,
    documentId?: string
  ): Promise<string[]> {
    await this.ensureInitialized();

    const queryEmbedding = await this.generateEmbeddings([query]);

    const whereFilter = documentId ? { documentId: documentId } : undefined;

    const results = await this.collection!.query({
      queryEmbeddings: queryEmbedding,
      nResults: topK,
      where: whereFilter,
    });

    return (results.documents?.[0] || []).filter((doc): doc is string => doc !== null);
  }

  /**
   * Delete all chunks for a specific document.
   */
  public async deleteDocument(documentId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.collection!.delete({
        where: { documentId: documentId },
      });
      this.logger.info(`Deleted vectors for document: ${documentId}`);
    } catch (error) {
      this.logger.warn(`Failed to delete vectors for document: ${documentId}`, error);
    }
  }

  /**
   * Generate embeddings using the available LLM provider.
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const { provider, apiKey } = config.getAvailableLLMProvider();

    if (provider === "gemini") {
      try {
        return await this.geminiEmbeddings(apiKey, texts);
      } catch (error) {
        this.logger.warn("Gemini embedding model failed or is unavailable. Falling back to simple heuristic embeddings.");
        // Proceed to fallback below
      }
    }
    
    // Fallback: simple hash-based embeddings for non-Gemini providers or when Gemini fails
    return this.simpleEmbeddings(texts);
  }

  private async geminiEmbeddings(apiKey: string, texts: string[]): Promise<number[][]> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    const embeddings: number[][] = [];
    for (const text of texts) {
      const result = await model.embedContent(text);
      embeddings.push(result.embedding.values);
    }
    return embeddings;
  }

  /**
   * Simple fallback embeddings using character frequency.
   * Used when Gemini embedding model is not available.
   */
  private async simpleEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map((text) => {
      const vec = new Array(384).fill(0);
      for (let i = 0; i < text.length; i++) {
        vec[text.charCodeAt(i) % 384] += 1;
      }
      // Normalize
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
