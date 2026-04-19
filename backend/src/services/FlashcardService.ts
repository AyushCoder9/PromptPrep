import { FlashcardRepository } from "../repositories/FlashcardRepository";
import { VectorStoreManager } from "./VectorStoreManager";
import { FlashcardGenerator, FlashcardItem } from "../generators/FlashcardGenerator";
import { Logger } from "../utils/logger";
import { GenerateOptions } from "../interfaces/IContentGenerator";
import { prisma } from "../repositories/BaseRepository";

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
      const sqliteChunks = await (prisma as any).documentChunk.findMany({
        where: { documentId },
        orderBy: { chunkIndex: "asc" },
        take: 8,
      });
      contextChunks = sqliteChunks.map((c: { content: string }) => c.content);
    }

    if (contextChunks.length === 0) {
      throw new Error("No content found for this document.");
    }

    const context = contextChunks.join("\n\n---\n\n");
    const flashcards = await this.generator.generate(context, options);

    // 3. Store in database
    for (const fc of flashcards) {
      await this.flashcardRepo.create({
        term: fc.term,
        definition: fc.definition,
        documentId,
      } as any);
    }

    this.logger.info(`Generated ${flashcards.length} flashcards for document: ${documentId}`);
    return flashcards;
  }

  async getFlashcardsByDocument(documentId: string) {
    return this.flashcardRepo.findByDocumentId(documentId);
  }

  async deleteFlashcard(id: string): Promise<void> {
    await this.flashcardRepo.delete(id);
  }
}
