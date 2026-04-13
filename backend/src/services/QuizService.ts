import { QuizRepository } from "../repositories/QuizRepository";
import { VectorStoreManager } from "./VectorStoreManager";
import { QuizGenerator, QuizResult } from "../generators/QuizGenerator";
import { Logger } from "../utils/logger";
import { GenerateOptions } from "../interfaces/IContentGenerator";
import { prisma } from "../repositories/BaseRepository";

/**
 * QuizService — Business Logic Layer
 *
 * Fetches context from vector store → uses QuizGenerator → stores result.
 */
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

  /**
   * Generate a quiz from a document's indexed content.
   */
  async generateQuiz(
    documentId: string,
    options?: GenerateOptions
  ): Promise<{ quizId: string; quiz: QuizResult }> {
    this.logger.info(`Generating quiz for document: ${documentId}`);

    // 1. Retrieve relevant context from vector store
    const topic = options?.topic || "the uploaded study material";
    let contextChunks = await this.vectorStore.similaritySearch(
      `Generate quiz questions about ${topic}`,
      8,
      documentId
    );

    // Fallback: if vector search returns nothing, read raw chunks from SQLite
    if (contextChunks.length === 0) {
      this.logger.warn(`Vector search returned empty for ${documentId}, reading chunks from SQLite`);
      const sqliteChunks = await (prisma as any).documentChunk.findMany({
        where: { documentId },
        orderBy: { chunkIndex: "asc" },
        take: 8,
      });
      contextChunks = sqliteChunks.map((c: { content: string }) => c.content);
    }

    if (contextChunks.length === 0) {
      throw new Error("No content found for this document. Please re-upload.");
    }

    const context = contextChunks.join("\n\n---\n\n");

    // 2. Generate quiz using the QuizGenerator
    const quizResult = await this.generator.generate(context, options);

    // 3. Store in database
    const quiz = await this.quizRepo.create({
      title: quizResult.title,
      difficulty: options?.difficulty || "medium",
      totalMarks: quizResult.questions.length,
      documentId,
    } as any);

    // Store questions
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

    this.logger.info(`Quiz generated: ${quiz.id} with ${quizResult.questions.length} questions`);
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
