import { BaseRepository } from "./BaseRepository";
import { Document } from "@prisma/client";

/**
 * DocumentRepository — Concrete Repository
 * Extends BaseRepository with document-specific queries.
 */
export class DocumentRepository extends BaseRepository<Document> {
  protected modelName = "document";

  protected get model() {
    return this.prisma.document;
  }

  async findByUserId(userId: string): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });
  }

  async findByHash(contentHash: string): Promise<Document | null> {
    return this.prisma.document.findFirst({
      where: { contentHash },
    });
  }

  async findWithRelations(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        quizzes: { include: { questions: true } },
        flashcards: true,
      },
    });
  }
}
