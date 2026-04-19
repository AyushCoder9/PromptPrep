export interface IDocumentParser {
  /**
   * Parse a file buffer and extract text content.
   * @param fileBuffer - The raw file data
   * @param fileName - Original file name for context
   * @returns Extracted text content
   */
  parse(fileBuffer: Buffer, fileName: string): Promise<string>;

  /**
   * Check if this parser supports the given MIME type.
   * Used by ParserFactory to select the correct strategy.
   * @param mimeType - The MIME type of the file
   */
  supports(mimeType: string): boolean;

  /**
   * Get the list of supported file extensions.
   */
  getSupportedExtensions(): string[];
}
