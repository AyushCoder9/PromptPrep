import { BaseContentGenerator } from "./BaseContentGenerator";
import { QuizGenerator } from "./QuizGenerator";
import { FlashcardGenerator } from "./FlashcardGenerator";

/**
 * GeneratorFactory — Factory Pattern
 *
 * Creates the appropriate content generator based on the requested type.
 * Centralizes object creation and hides concrete class details.
 */
export class GeneratorFactory {
  /**
   * Create a content generator based on the type string.
   * @param type - The type of generator: "quiz" or "flashcard"
   * @returns The appropriate generator instance
   */
  public static create(type: "quiz" | "flashcard"): BaseContentGenerator<unknown> {
    switch (type) {
      case "quiz":
        return new QuizGenerator();
      case "flashcard":
        return new FlashcardGenerator();
      default:
        throw new Error(`Unknown generator type: ${type}. Supported: quiz, flashcard`);
    }
  }
}
