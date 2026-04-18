import {
  IContentGenerator,
  GenerateOptions,
} from "../interfaces/IContentGenerator";
import { config } from "../config/env";
import { Logger } from "../utils/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

/**
 * BaseContentGenerator — Abstract Class (Template Method Pattern)
 *
 * Defines the skeleton algorithm for AI content generation:
 *   1. Build prompt (abstract — subclass-specific)
 *   2. Call LLM (shared logic with fallback)
 *   3. Parse response (abstract — subclass-specific)
 *
 * QuizGenerator and FlashcardGenerator extend this class,
 * each providing their own prompt templates and response parsers.
 */
export abstract class BaseContentGenerator<T> implements IContentGenerator<T> {
  protected logger: Logger;

  constructor(loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Template Method — orchestrates the generation flow.
   */
  public async generate(context: string, options?: GenerateOptions): Promise<T> {
    this.logger.info(`Starting generation with ${context.length} chars of context`);

    const prompt = this.buildPrompt(context, options);
    const rawResponse = await this.callLLM(prompt);
    const result = this.parseResponse(rawResponse);

    this.logger.info("Generation completed successfully");
    return result;
  }

  /**
   * Build the LLM prompt. Each subclass defines its own template.
   */
  protected abstract buildPrompt(context: string, options?: GenerateOptions): string;

  /**
   * Parse the raw LLM response into the target type.
   */
  protected abstract parseResponse(raw: string): T;

  /**
   * Get the type identifier for this generator.
   */
  public abstract getType(): string;

  /**
   * Call the LLM with fallback support (Gemini → Groq).
   */
  protected async callLLM(prompt: string): Promise<string> {
    // Always try Gemini first if key is available
    if (config.geminiApiKey && config.geminiApiKey !== "your_gemini_api_key_here") {
      try {
        return await this.callGemini(config.geminiApiKey, prompt);
      } catch (geminiError: any) {
        this.logger.warn(`Gemini failed (${geminiError?.message?.substring(0, 80)}). Falling back to Groq...`);
      }
    }

    // Fallback to Groq
    if (config.groqApiKey && config.groqApiKey !== "your_groq_api_key_here") {
      try {
        return await this.callGroq(config.groqApiKey, prompt);
      } catch (groqError: any) {
        this.logger.error(`Groq fallback also failed: ${groqError?.message}`);
        throw new Error("All AI providers are currently unavailable. Please try again in a moment.");
      }
    }

    throw new Error("No LLM API key configured. Please add GEMINI_API_KEY or GROQ_API_KEY.");
  }

  private async callGemini(apiKey: string, prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async callGroq(apiKey: string, prompt: string): Promise<string> {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
    });
    return completion.choices[0]?.message?.content || "";
  }
}
