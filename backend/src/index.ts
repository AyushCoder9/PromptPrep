import { createApp } from "./app";
import { config } from "./config/env";
import { VectorStoreManager } from "./services/VectorStoreManager";
import { Logger } from "./utils/logger";
import { prisma } from "./repositories/BaseRepository";

const logger = new Logger("Server");

async function bootstrap() {
  logger.info("Starting PromptPrep server...");


  try {
    await prisma.user.upsert({
      where: { username: "default" },
      update: {},
      create: {
        id: "default-user",
        username: "default",
        role: "student",
      },
    });
  } catch (e) {
    logger.warn("Could not create default user (DB may not be ready)", e);
  }


  try {
    const vectorStore = VectorStoreManager.getInstance();
    await vectorStore.initialize();
    logger.info("Vector store initialized");
  } catch (error) {
    logger.warn("ChromaDB not available. Vector features will be limited.", error);
  }


  try {
    const { provider } = config.getAvailableLLMProvider();
    logger.info(`LLM provider available: ${provider}`);
  } catch {
    logger.warn("No LLM API key configured. Add GEMINI_API_KEY or GROQ_API_KEY to .env");
  }


  const app = createApp();
  app.listen(config.port, () => {
    logger.info(`🚀 PromptPrep API running at http://localhost:${config.port}`);
    logger.info(`📋 Health check: http://localhost:${config.port}/api/health`);
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
