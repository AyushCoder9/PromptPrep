import { IDocumentParser } from "../interfaces/IDocumentParser";
import { Logger } from "../utils/logger";

export class TextParser implements IDocumentParser {
  private logger = new Logger("TextParser");

  async parse(fileBuffer: Buffer, fileName: string): Promise<string> {
    this.logger.info(`Parsing text file: ${fileName}`);

    const text = fileBuffer.toString("utf-8").trim();

    if (!text || text.length === 0) {
      throw new Error(`No text content in file: ${fileName}`);
    }

    this.logger.info(`Extracted ${text.length} characters from ${fileName}`);
    return text;
  }

  supports(mimeType: string): boolean {
    return (
      mimeType === "text/plain" ||
      mimeType === "text/markdown" ||
      mimeType === "application/octet-stream"
    );
  }

  getSupportedExtensions(): string[] {
    return [".txt", ".md"];
  }
}
