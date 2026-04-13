/**
 * Text chunking utility for RAG pipeline.
 * Splits large documents into overlapping chunks for vector indexing.
 */
export interface TextChunk {
  content: string;
  index: number;
  metadata: {
    startChar: number;
    endChar: number;
    wordCount: number;
  };
}

export class TextChunker {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  /**
   * Split text into overlapping chunks.
   * Tries to split on paragraph boundaries first, then sentences.
   */
  public chunk(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    const cleanedText = text.replace(/\n{3,}/g, "\n\n").trim();

    if (cleanedText.length <= this.chunkSize) {
      return [
        {
          content: cleanedText,
          index: 0,
          metadata: {
            startChar: 0,
            endChar: cleanedText.length,
            wordCount: this.countWords(cleanedText),
          },
        },
      ];
    }

    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < cleanedText.length) {
      let endIndex = Math.min(startIndex + this.chunkSize, cleanedText.length);

      // Try to break at a paragraph boundary
      if (endIndex < cleanedText.length) {
        const paragraphBreak = cleanedText.lastIndexOf("\n\n", endIndex);
        if (paragraphBreak > startIndex + this.chunkSize / 2) {
          endIndex = paragraphBreak;
        } else {
          // Try sentence boundary
          const sentenceBreak = cleanedText.lastIndexOf(". ", endIndex);
          if (sentenceBreak > startIndex + this.chunkSize / 2) {
            endIndex = sentenceBreak + 1;
          }
        }
      }

      const chunkContent = cleanedText.slice(startIndex, endIndex).trim();

      if (chunkContent.length > 0) {
        chunks.push({
          content: chunkContent,
          index: chunkIndex++,
          metadata: {
            startChar: startIndex,
            endChar: endIndex,
            wordCount: this.countWords(chunkContent),
          },
        });
      }

      startIndex = endIndex - this.chunkOverlap;
      if (startIndex >= cleanedText.length) break;
      if (endIndex >= cleanedText.length) break;
    }

    return chunks;
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }
}
