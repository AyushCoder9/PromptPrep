import { DocumentRepository } from "../repositories/DocumentRepository";
import { VectorStoreManager } from "./VectorStoreManager";
import { ParserFactory } from "../parsers/ParserFactory";
import { TextChunker } from "../utils/chunker";
import { Logger } from "../utils/logger";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { config } from "../config/env";
import { memoryStore } from "./InMemoryStore";

export class DocumentService {
  private documentRepo: DocumentRepository;
  private vectorStore: VectorStoreManager;
  private chunker: TextChunker;
  private logger = new Logger("DocumentService");

  constructor() {
    this.documentRepo = new DocumentRepository();
    this.vectorStore = VectorStoreManager.getInstance();
    this.chunker = new TextChunker(1000, 200);
  }

  async uploadDocument(
    file: Express.Multer.File,
    userId: string
  ): Promise<{ id: string; title: string; chunkCount: number }> {
    this.logger.info(`Processing upload: ${file.originalname}`);

    const parser = ParserFactory.getParser(file.mimetype);
    const textContent = await parser.parse(file.buffer, file.originalname);

    const contentHash = createHash("sha256").update(textContent).digest("hex");

    // Check for duplicate — try DB first, fallback to memory
    try {
      const existing = await this.documentRepo.findByHash(contentHash);
      if (existing) {
        return { id: existing.id, title: existing.title, chunkCount: existing.chunkCount };
      }
    } catch {
      this.logger.warn("DB unreachable during duplicate check, checking in-memory store");
      const memExisting = memoryStore.findDocumentByHash(contentHash);
      if (memExisting) {
        return { id: memExisting.id, title: memExisting.title, chunkCount: memExisting.chunkCount };
      }
    }

    const fileId = uuidv4();
    const uploadsDir = config.uploadDir;
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, `${fileId}_${file.originalname}`);
    fs.writeFileSync(filePath, file.buffer);

    const chunks = this.chunker.chunk(textContent);
    const chunkTexts = chunks.map((c) => c.content);
    const title = file.originalname.replace(/\.[^.]+$/, "");

    const docData = {
      id: fileId,
      title,
      fileName: file.originalname,
      contentHash,
      filePath,
      mimeType: file.mimetype,
      chunkCount: chunkTexts.length,
      userId,
    };

    const chunkData = chunkTexts.map((content, i) => ({
      id: `${fileId}_chunk_${i}`,
      content,
      chunkIndex: i,
      documentId: fileId,
    }));

    // Always store in memory (instant, guaranteed)
    memoryStore.addDocument(docData);
    memoryStore.addChunks(fileId, chunkData);

    // Try to persist to Supabase (non-blocking if it fails)
    try {
      await this.documentRepo.create(docData);
      await (this.documentRepo as any)["prisma"].documentChunk.createMany({
        data: chunkData,
      });
      this.logger.info("Document persisted to Supabase");
    } catch (dbError: any) {
      this.logger.warn(`Supabase write failed (${dbError?.message?.substring(0, 60)}). Data is safe in memory.`);
    }

    // Try to index embeddings
    try {
      await this.vectorStore.addDocuments(chunkTexts, {
        documentId: fileId,
        title,
      });
    } catch (error) {
      this.logger.warn("Vector store indexing failed, in-memory search will be used");
    }

    this.logger.info(`Document processed: ${title}`);
    return { id: fileId, title, chunkCount: chunkTexts.length };
  }

  async getDocuments(userId: string) {
    try {
      const docs = await this.documentRepo.findByUserId(userId);
      // Merge any in-memory-only documents
      const dbIds = new Set(docs.map((d: any) => d.id));
      const memDocs = memoryStore.getDocumentsByUser(userId).filter((d) => !dbIds.has(d.id));
      return [...docs, ...memDocs];
    } catch {
      this.logger.warn("DB unreachable, serving documents from in-memory store");
      return memoryStore.getDocumentsByUser(userId);
    }
  }

  async getDocument(id: string) {
    try {
      const doc = await this.documentRepo.findWithRelations(id);
      if (doc) return doc;
    } catch {
      this.logger.warn("DB unreachable, serving document from in-memory store");
    }
    // Fallback to memory
    const memDoc = memoryStore.getDocument(id);
    if (memDoc) {
      return {
        ...memDoc,
        quizzes: memoryStore.getQuizzesByDocument(id),
        flashcards: memoryStore.getFlashcardsByDocument(id),
      };
    }
    return null;
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await this.vectorStore.deleteDocument(id);
      await this.documentRepo.delete(id);
    } catch {
      this.logger.warn("DB unreachable during delete, removing from in-memory store only");
    }
    memoryStore.deleteDocument(id);
  }
}
