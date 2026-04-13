import { Request, Response, NextFunction } from "express";
import { DocumentService } from "../services/DocumentService";
import { Logger } from "../utils/logger";

/**
 * DocumentController — HTTP Layer
 *
 * Handles document-related HTTP requests.
 * Delegates business logic to DocumentService.
 */
export class DocumentController {
  private service: DocumentService;
  private logger = new Logger("DocumentController");

  constructor() {
    this.service = new DocumentService();
  }

  /**
   * POST /api/documents/upload
   */
  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      // Use a default user for now (no auth implemented)
      const userId = req.body.userId || "default-user";

      const result = await this.service.uploadDocument(file, userId);
      res.status(201).json({
        message: "Document uploaded and processed successfully",
        data: result,
      });
    } catch (error: any) {
      this.logger.error("Upload failed", error);
      next(error);
    }
  };

  /**
   * GET /api/documents
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.query.userId as string) || "default-user";
      const documents = await this.service.getDocuments(userId);
      res.json({ data: documents });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/documents/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const document = await this.service.getDocument(req.params.id);
      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }
      res.json({ data: document });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/documents/:id
   */
  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteDocument(req.params.id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
