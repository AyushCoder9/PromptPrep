import { QuizRepository } from "../repositories/QuizRepository";
import { VectorStoreManager } from "./VectorStoreManager";
import { QuizGenerator, QuizResult } from "../generators/QuizGenerator";
import { Logger } from "../utils/logger";
import { GenerateOptions } from "../interfaces/IContentGenerator";
import { prisma } from "../repositories/BaseRepository";

export class QuizService {
  private quizRepo: QuizRepository;
  private vectorStore: VectorStoreManager;
  private generator: QuizGenerator;
  private logger = new Logger("QuizService");

  constructor() {
    this.quizRepo = new QuizRepository();
    this.vectorStore = VectorStoreManager.getInstance();
    this.generator = new QuizGenerator();
  }

  async generateQuiz(
    documentId: string,
    options?: GenerateOptions
  ): Promise<{ quizId: string; quiz: QuizResult }> {
    this.logger.info(`Generating quiz for document: ${documentId}`);

    const topic = options?.topic || "the uploaded study material";
    let contextChunks = await this.vectorStore.similaritySearch(
      `Generate quiz questions about ${topic}`,
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
    const quizResult = await this.generator.generate(context, options);

    const quiz = await this.quizRepo.create({
      title: quizResult.title,
      difficulty: options?.difficulty || "medium",
      totalMarks: quizResult.questions.length,
      documentId,
    } as any);

    for (const q of quizResult.questions) {
      await this.quizRepo["prisma"].question.create({
        data: {
          text: q.text,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          quizId: quiz.id,
        },
      });
    }

    return { quizId: quiz.id, quiz: quizResult };
  }

  async getQuiz(id: string) {
    const quiz = await this.quizRepo.findWithQuestions(id);
    if (!quiz) throw new Error("Quiz not found");

    return {
      ...quiz,
      questions: (quiz as any).questions.map((q: any) => ({
        ...q,
        options: JSON.parse(q.options),
      })),
    };
  }

  async getQuizzesByDocument(documentId: string) {
    return this.quizRepo.findByDocumentId(documentId);
  }

  async submitQuiz(quizId: string, answers: Record<string, string>) {
    const quiz = await this.getQuiz(quizId);
    let score = 0;

    const results = (quiz as any).questions.map((q: any) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) score++;
      return {
        questionId: q.id,
        text: q.text,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    await this.quizRepo.updateScore(quizId, score);

    return {
      quizId,
      score,
      totalMarks: (quiz as any).questions.length,
      percentage: Math.round((score / (quiz as any).questions.length) * 100),
      results,
    };
  }
}
