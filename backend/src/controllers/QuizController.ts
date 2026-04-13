import { Request, Response, NextFunction } from "express";
import { QuizService } from "../services/QuizService";
import { Logger } from "../utils/logger";

/**
 * QuizController — HTTP Layer
 */
export class QuizController {
  private service: QuizService;
  private logger = new Logger("QuizController");

  constructor() {
    this.service = new QuizService();
  }

  /**
   * POST /api/quizzes/generate
   */
  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documentId, difficulty, count, topic } = req.body;
      if (!documentId) {
        res.status(400).json({ error: "documentId is required" });
        return;
      }

      const result = await this.service.generateQuiz(documentId, {
        difficulty,
        count: count || 5,
        topic,
      });

      res.status(201).json({
        message: "Quiz generated successfully",
        data: result,
      });
    } catch (error) {
      this.logger.error("Quiz generation failed", error);
      next(error);
    }
  };

  /**
   * GET /api/quizzes/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quiz = await this.service.getQuiz(req.params.id);
      res.json({ data: quiz });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/quizzes/document/:documentId
   */
  getByDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizzes = await this.service.getQuizzesByDocument(req.params.documentId);
      res.json({ data: quizzes });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/quizzes/:id/submit
   */
  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { answers } = req.body;
      if (!answers) {
        res.status(400).json({ error: "answers object is required" });
        return;
      }

      const result = await this.service.submitQuiz(req.params.id, answers);
      res.json({
        message: "Quiz submitted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
