import { Request, Response, NextFunction } from "express";
import { QAService } from "../services/QAService";
import { Logger } from "../utils/logger";

export class QAController {
  private service: QAService;
  private logger = new Logger("QAController");

  constructor() {
    this.service = new QAService();
  }

  /**
   * POST /api/qa/ask
   */
  ask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { question, documentId } = req.body;
      if (!question) {
        res.status(400).json({ error: "question is required" });
        return;
      }

      const result = await this.service.askQuestion(question, documentId);
      res.json({
        data: result,
      });
    } catch (error) {
      this.logger.error("QA failed", error);
      next(error);
    }
  };
}
