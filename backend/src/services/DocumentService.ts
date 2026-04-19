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
    const existing = await this.documentRepo.findByHash(contentHash);
    if (existing) {
      return { id: existing.id, title: existing.title, chunkCount: existing.chunkCount };
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
    const document = await this.documentRepo.create({
      id: fileId,
      title,
      fileName: file.originalname,
      contentHash,
      filePath,
      mimeType: file.mimetype,
      chunkCount: chunkTexts.length,
      userId,
    });

    for (let i = 0; i < chunkTexts.length; i++) {
      await (this.documentRepo as any)["prisma"].documentChunk.create({
        data: {
          id: `${fileId}_chunk_${i}`,
          content: chunkTexts[i],
          chunkIndex: i,
          documentId: document.id,
        },
      });
    }

    try {
      await this.vectorStore.addDocuments(chunkTexts, {
        documentId: document.id,
        title: document.title,
      });
    } catch (error) {
      this.logger.warn("Vector store indexing failed", error);
    }

    this.logger.info(`Document processed: ${document.title}`);
    return { id: document.id, title: document.title, chunkCount: chunkTexts.length };
  }

  async getDocuments(userId: string) {
    return this.documentRepo.findByUserId(userId);
  }

  async getDocument(id: string) {
    return this.documentRepo.findWithRelations(id);
  }

  async deleteDocument(id: string): Promise<void> {
    await this.vectorStore.deleteDocument(id);
    await this.documentRepo.delete(id);
  }
}
