import { FlashcardRepository } from "../repositories/FlashcardRepository";
import { VectorStoreManager } from "./VectorStoreManager";
import { FlashcardGenerator, FlashcardItem } from "../generators/FlashcardGenerator";
import { Logger } from "../utils/logger";
import { GenerateOptions } from "../interfaces/IContentGenerator";
import { prisma } from "../repositories/BaseRepository";
import { memoryStore } from "./InMemoryStore";
import { v4 as uuidv4 } from "uuid";

export class FlashcardService {
  private flashcardRepo: FlashcardRepository;
  private vectorStore: VectorStoreManager;
  private generator: FlashcardGenerator;
  private logger = new Logger("FlashcardService");

  constructor() {
    this.flashcardRepo = new FlashcardRepository();
    this.vectorStore = VectorStoreManager.getInstance();
    this.generator = new FlashcardGenerator();
  }

  async generateFlashcards(
    documentId: string,
    options?: GenerateOptions
  ): Promise<FlashcardItem[]> {
    this.logger.info(`Generating flashcards for document: ${documentId}`);

    const topic = options?.topic || "key concepts from the study material";
    let contextChunks = await this.vectorStore.similaritySearch(
      `Extract key terms and definitions about ${topic}`,
      8,
      documentId
    );

    if (contextChunks.length === 0) {
      this.logger.warn(`Vector search returned empty, falling back to database chunks`);
      try {
        const dbChunks = await (prisma as any).documentChunk.findMany({
          where: { documentId },
          orderBy: { chunkIndex: "asc" },
          take: 8,
        });
        contextChunks = dbChunks.map((c: { content: string }) => c.content);
      } catch {
        this.logger.warn("DB unreachable, falling back to in-memory chunks");
        const memChunks = memoryStore.getChunks(documentId, 8);
        contextChunks = memChunks.map((c: any) => c.content);
      }
    }

    if (contextChunks.length === 0) {
      throw new Error("No content found for this document.");
    }

    const context = contextChunks.join("\n\n---\n\n");
    const flashcards = await this.generator.generate(context, options);

    // Store in database with in-memory fallback
    for (const fc of flashcards) {
      const fcData = {
        id: uuidv4(),
        term: fc.term,
        definition: fc.definition,
        documentId,
      };
      try {
        await this.flashcardRepo.create(fcData as any);
      } catch {
        this.logger.warn("DB unreachable, storing flashcard in memory only");
      }
      memoryStore.addFlashcard(documentId, fcData);
    }

    this.logger.info(`Generated ${flashcards.length} flashcards for document: ${documentId}`);
    return flashcards;
  }

  async getFlashcardsByDocument(documentId: string) {
    try {
      const dbCards = await this.flashcardRepo.findByDocumentId(documentId);
      if (dbCards.length > 0) return dbCards;
    } catch {
      this.logger.warn("DB unreachable, serving flashcards from memory");
    }
    return memoryStore.getFlashcardsByDocument(documentId);
  }

  async deleteFlashcard(id: string): Promise<void> {
    try {
      await this.flashcardRepo.delete(id);
    } catch {
      this.logger.warn("DB unreachable, deleting flashcard from memory only");
    }
    memoryStore.deleteFlashcard(id);
  }
}
