import express from "express";
import cors from "cors";
import documentRoutes from "./routes/documentRoutes";
import quizRoutes from "./routes/quizRoutes";
import flashcardRoutes from "./routes/flashcardRoutes";
import qaRoutes from "./routes/qaRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { Logger } from "./utils/logger";

const logger = new Logger("App");

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: true, // Allow all origins like the previous setup, but more explicit
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Routes
  app.use("/api/documents", documentRoutes);
  app.use("/api/quizzes", quizRoutes);
  app.use("/api/flashcards", flashcardRoutes);
  app.use("/api/qa", qaRoutes);

  // Global error handler (must be last)
  app.use(errorHandler);

  logger.info("Express app configured");
  return app;
}
