import { BaseRepository } from "./BaseRepository";
import { Flashcard } from "@prisma/client";

export class FlashcardRepository extends BaseRepository<Flashcard> {
  protected modelName = "flashcard";

  protected get model() {
    return this.prisma.flashcard;
  }

  async findByDocumentId(documentId: string): Promise<Flashcard[]> {
    return this.prisma.flashcard.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.prisma.flashcard.deleteMany({
      where: { documentId },
    });
  }
}
