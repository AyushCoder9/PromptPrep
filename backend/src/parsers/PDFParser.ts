import { IDocumentParser } from "../interfaces/IDocumentParser";
import pdfParse from "pdf-parse";
import { Logger } from "../utils/logger";

export class PDFParser implements IDocumentParser {
  private logger = new Logger("PDFParser");

  async parse(fileBuffer: Buffer, fileName: string): Promise<string> {
    this.logger.info(`Parsing PDF: ${fileName}`);

    try {
      const result = await pdfParse(fileBuffer);
      const text = result.text.trim();

      if (!text || text.length === 0) {
        throw new Error(`No text content extracted from PDF: ${fileName}`);
      }

      this.logger.info(`Extracted ${text.length} characters from ${fileName}`);
      return text;
    } catch (error) {
      this.logger.error(`Failed to parse PDF: ${fileName}`, error);
      throw new Error(`PDF parsing failed for ${fileName}: ${error}`);
    }
  }

  supports(mimeType: string): boolean {
    return mimeType === "application/pdf";
  }

  getSupportedExtensions(): string[] {
    return [".pdf"];
  }
}
