import { BaseContentGenerator } from "./BaseContentGenerator";
import { GenerateOptions } from "../interfaces/IContentGenerator";

export interface FlashcardItem {
  term: string;
  definition: string;
}

export class FlashcardGenerator extends BaseContentGenerator<FlashcardItem[]> {
  constructor() {
    super("FlashcardGenerator");
  }

  public getType(): string {
    return "flashcard";
  }

  protected buildPrompt(context: string, options?: GenerateOptions): string {
    const count = options?.count || 10;
    const topic = options?.topic || "the provided material";

    return `You are an expert educational content creator. Based on the following study material, generate exactly ${count} flashcards about ${topic}.

STUDY MATERIAL:
---
${context}
---

INSTRUCTIONS:
- Generate exactly ${count} flashcards
- Each flashcard has a concise "term" (key concept, word, or phrase) and a clear "definition" (explanation)
- Focus on the most important concepts
- Definitions should be clear and suitable for studying
- Cover a range of topics from the material

Respond ONLY with valid JSON in this exact format, no markdown:
{
  "flashcards": [
    {
      "term": "Key Concept",
      "definition": "Clear, concise explanation of the concept."
    }
  ]
}`;
  }

  protected parseResponse(raw: string): FlashcardItem[] {
    try {
      let cleaned = raw.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(cleaned);

      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        throw new Error("Response missing 'flashcards' array");
      }

      return parsed.flashcards.map((f: FlashcardItem) => ({
        term: f.term,
        definition: f.definition,
      }));
    } catch (error) {
      this.logger.error("Failed to parse flashcard response", error);
      throw new Error(`Flashcard generation failed: could not parse LLM response. ${error}`);
    }
  }
}
