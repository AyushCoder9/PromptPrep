import { BaseRepository } from "./BaseRepository";
import { Quiz } from "@prisma/client";

export class QuizRepository extends BaseRepository<Quiz> {
  protected modelName = "quiz";

  protected get model() {
    return this.prisma.quiz;
  }

  async findByDocumentId(documentId: string): Promise<Quiz[]> {
    return this.prisma.quiz.findMany({
      where: { documentId },
      include: { questions: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findWithQuestions(id: string): Promise<Quiz | null> {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });
  }

  async updateScore(id: string, score: number): Promise<Quiz> {
    return this.prisma.quiz.update({
      where: { id },
      data: { score },
    });
  }
}
