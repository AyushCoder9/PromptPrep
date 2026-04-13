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
    const { provider, apiKey } = config.getAvailableLLMProvider();
    this.logger.info(`Using LLM provider: ${provider}`);

    try {
      if (provider === "gemini") {
        return await this.callGemini(apiKey, prompt);
      } else if (provider === "groq") {
        return await this.callGroq(apiKey, prompt);
      }
      throw new Error(`Unknown provider: ${provider}`);
    } catch (error) {
      this.logger.error(`LLM call failed with ${provider}`, error);

      // Try fallback if primary fails
      try {
        if (provider === "gemini" && config.groqApiKey) {
          this.logger.info("Falling back to Groq...");
          return await this.callGroq(config.groqApiKey, prompt);
        } else if (provider === "groq" && config.geminiApiKey) {
          this.logger.info("Falling back to Gemini...");
          return await this.callGemini(config.geminiApiKey, prompt);
        }
      } catch (fallbackError) {
        this.logger.error("Fallback LLM also failed", fallbackError);
      }

      throw new Error(`All LLM providers failed. Last error: ${error}`);
    }
  }

  private async callGemini(apiKey: string, prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
