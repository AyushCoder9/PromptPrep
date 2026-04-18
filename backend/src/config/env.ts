import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export class EnvConfig {
  private static instance: EnvConfig;

  public readonly port: number;
  public readonly nodeEnv: string;
  public readonly databaseUrl: string;
  public readonly chromaHost: string;
  public readonly uploadDir: string;

  // Fallback API key system
  public readonly geminiApiKey?: string;
  public readonly groqApiKey?: string;

  private constructor() {
    this.port = parseInt(process.env.PORT || "3001", 10);
    this.nodeEnv = process.env.NODE_ENV || "development";
    this.databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
    this.chromaHost = process.env.CHROMA_HOST || "http://localhost:8000";
    
    // Vercel filesystem is read-only except for /tmp
    const isVercel = process.env.VERCEL === "1";
    this.uploadDir = isVercel 
      ? path.join("/tmp", "uploads")
      : path.resolve(__dirname, "../../uploads");

    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.groqApiKey = process.env.GROQ_API_KEY;
  }

  public static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  /**
   * Returns the first available API key and its provider.
   * Priority: Gemini → Groq
   */
  public getAvailableLLMProvider(): { provider: string; apiKey: string } {
    if (this.geminiApiKey && this.geminiApiKey !== "your_gemini_api_key_here") {
      return { provider: "gemini", apiKey: this.geminiApiKey };
    }
    if (this.groqApiKey && this.groqApiKey !== "your_groq_api_key_here") {
      return { provider: "groq", apiKey: this.groqApiKey };
    }
    throw new Error(
      "No LLM API key configured. Please add GEMINI_API_KEY or GROQ_API_KEY to your .env file."
    );
  }

  public isDevelopment(): boolean {
    return this.nodeEnv === "development";
  }
}

export const config = EnvConfig.getInstance();
