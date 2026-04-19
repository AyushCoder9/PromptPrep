export interface GenerateOptions {
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
  topic?: string;
}

export interface IContentGenerator<T> {
  /**
   * Generate study content from the provided context.
   * @param context - Text context retrieved from the vector store
   * @param options - Optional generation parameters
   * @returns Generated content of type T
   */
  generate(context: string, options?: GenerateOptions): Promise<T>;

  /**
   * Get the type identifier for this generator.
   */
  getType(): string;
}
