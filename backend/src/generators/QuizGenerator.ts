import { BaseContentGenerator } from "./BaseContentGenerator";
import { GenerateOptions } from "../interfaces/IContentGenerator";

export interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  title: string;
  questions: QuizQuestion[];
}

/**
 * QuizGenerator — Extends BaseContentGenerator
 *
 * Generates MCQ quizzes from study material context.
 * Overrides buildPrompt() and parseResponse() from the abstract base.
 */
export class QuizGenerator extends BaseContentGenerator<QuizResult> {
  constructor() {
    super("QuizGenerator");
  }

  public getType(): string {
    return "quiz";
  }

  protected buildPrompt(context: string, options?: GenerateOptions): string {
    const count = options?.count || 5;
    const difficulty = options?.difficulty || "medium";
    const topic = options?.topic || "the provided material";

    return `You are an expert educational quiz generator. Based on the following study material, generate exactly ${count} multiple-choice questions at ${difficulty} difficulty level about ${topic}.

STUDY MATERIAL:
---
${context}
---

INSTRUCTIONS:
- Generate exactly ${count} questions
- Each question must have exactly 4 options (A, B, C, D)
- Include a clear explanation for the correct answer
- Questions should test understanding, not just memorization
- Vary question types: factual recall, conceptual understanding, application

Respond ONLY with valid JSON in this exact format, no markdown:
{
  "title": "Quiz: ${topic}",
  "questions": [
    {
      "text": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A) Option 1",
      "explanation": "Explanation of why this is correct."
    }
  ]
}`;
  }

  protected parseResponse(raw: string): QuizResult {
    try {
      // Strip markdown code blocks if present
      let cleaned = raw.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(cleaned);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Response missing 'questions' array");
      }

      return {
        title: parsed.title || "Generated Quiz",
        questions: parsed.questions.map((q: QuizQuestion) => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "",
        })),
      };
    } catch (error) {
      this.logger.error("Failed to parse quiz response", error);
      throw new Error(`Quiz generation failed: could not parse LLM response. ${error}`);
    }
  }
}
