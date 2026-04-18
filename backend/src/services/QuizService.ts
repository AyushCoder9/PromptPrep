import { QuizRepository } from "../repositories/QuizRepository";
import { VectorStoreManager } from "./VectorStoreManager";
import { QuizGenerator, QuizResult } from "../generators/QuizGenerator";
import { Logger } from "../utils/logger";
import { GenerateOptions } from "../interfaces/IContentGenerator";
import { prisma } from "../repositories/BaseRepository";
import { memoryStore } from "./InMemoryStore";
import { v4 as uuidv4 } from "uuid";

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
    const quizResult = await this.generator.generate(context, options);

    const quizId = uuidv4();
    const quizData = {
      id: quizId,
      title: quizResult.title,
      difficulty: options?.difficulty || "medium",
      totalMarks: quizResult.questions.length,
      documentId,
    };

    // Try to persist to DB, fall back to memory
    let persistedQuiz: any = null;
    try {
      persistedQuiz = await this.quizRepo.create(quizData as any);
      for (const q of quizResult.questions) {
        await this.quizRepo["prisma"].question.create({
          data: {
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            quizId: persistedQuiz.id,
          },
        });
      }
    } catch {
      this.logger.warn("DB unreachable, storing quiz in memory only");
      persistedQuiz = quizData;
    }

    // Always store in memory for resilience
    memoryStore.addQuiz(persistedQuiz);
    for (const q of quizResult.questions) {
      memoryStore.addQuestion(persistedQuiz.id, {
        id: uuidv4(),
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        quizId: persistedQuiz.id,
      });
    }

    return { quizId: persistedQuiz.id, quiz: quizResult };
  }

  async getQuiz(id: string) {
    // Try DB first
    try {
      const quiz = await this.quizRepo.findWithQuestions(id);
      if (quiz) {
        return {
          ...quiz,
          questions: (quiz as any).questions.map((q: any) => ({
            ...q,
            options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          })),
        };
      }
    } catch {
      this.logger.warn("DB unreachable, serving quiz from memory");
    }

    // Fallback to memory
    const memQuiz = memoryStore.getQuiz(id);
    if (!memQuiz) throw new Error("Quiz not found");
    return memQuiz;
  }

  async getQuizzesByDocument(documentId: string) {
    try {
      const quizzes = await this.quizRepo.findByDocumentId(documentId);
      if (quizzes.length > 0) return quizzes;
    } catch {
      this.logger.warn("DB unreachable, serving quizzes from memory");
    }
    return memoryStore.getQuizzesByDocument(documentId);
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

    // Try to persist score to DB
    try {
      await this.quizRepo.updateScore(quizId, score);
    } catch {
      this.logger.warn("DB unreachable, storing score in memory only");
    }
    memoryStore.updateQuizScore(quizId, score);

    return {
      quizId,
      score,
      totalMarks: (quiz as any).questions.length,
      percentage: Math.round((score / (quiz as any).questions.length) * 100),
      results,
    };
  }
}
