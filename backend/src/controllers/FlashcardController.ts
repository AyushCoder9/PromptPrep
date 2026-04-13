import { Request, Response, NextFunction } from "express";
import { FlashcardService } from "../services/FlashcardService";
import { Logger } from "../utils/logger";

/**
 * FlashcardController — HTTP Layer
 */
export class FlashcardController {
  private service: FlashcardService;
  private logger = new Logger("FlashcardController");

  constructor() {
    this.service = new FlashcardService();
  }

  /**
   * POST /api/flashcards/generate
   */
  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documentId, count, topic } = req.body;
      if (!documentId) {
        res.status(400).json({ error: "documentId is required" });
        return;
      }

      const flashcards = await this.service.generateFlashcards(documentId, {
        count: count || 10,
        topic,
      });

      res.status(201).json({
        message: "Flashcards generated successfully",
        data: flashcards,
      });
    } catch (error) {
      this.logger.error("Flashcard generation failed", error);
      next(error);
    }
  };

  /**
   * GET /api/flashcards/document/:documentId
   */
  getByDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flashcards = await this.service.getFlashcardsByDocument(req.params.documentId);
      res.json({ data: flashcards });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/flashcards/:id
   */
  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteFlashcard(req.params.id);
      res.json({ message: "Flashcard deleted" });
    } catch (error) {
      next(error);
    }
  };
}
