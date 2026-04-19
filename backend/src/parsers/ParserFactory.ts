import { IDocumentParser } from "../interfaces/IDocumentParser";
import { PDFParser } from "./PDFParser";
import { TextParser } from "./TextParser";

export class ParserFactory {
  private static parsers: IDocumentParser[] = [
    new PDFParser(),
    new TextParser(),
  ];

  /**
   * Get the appropriate parser for the given MIME type.
   * @param mimeType - The MIME type of the uploaded file
   * @returns The matching parser strategy
   * @throws Error if no parser supports the MIME type
   */
  public static getParser(mimeType: string): IDocumentParser {
    const parser = this.parsers.find((p) => p.supports(mimeType));

    if (!parser) {
      throw new Error(
        `Unsupported file type: ${mimeType}. Supported types: ${this.getSupportedTypes().join(", ")}`
      );
    }

    return parser;
  }

  /**
   * Get all supported MIME types across all parsers.
   */
  public static getSupportedTypes(): string[] {
    return ["application/pdf", "text/plain", "text/markdown"];
  }

  /**
   * Get all supported file extensions.
   */
  public static getSupportedExtensions(): string[] {
    return this.parsers.flatMap((p) => p.getSupportedExtensions());
  }
}
