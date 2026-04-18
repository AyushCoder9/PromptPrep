import { Logger } from "../utils/logger";

/**
 * InMemoryStore — Resilience Layer
 *
 * Mirrors Supabase/Prisma storage in-memory so the entire app
 * continues to work even when the database is unreachable.
 * Data lives for the lifetime of the serverless container.
 */
export class InMemoryStore {
  private static instance: InMemoryStore;
  private logger = new Logger("InMemoryStore");

  // Core collections
  private documents: Map<string, any> = new Map();
  private chunks: Map<string, any[]> = new Map();       // documentId → chunks[]
  private quizzes: Map<string, any> = new Map();
  private questions: Map<string, any[]> = new Map();     // quizId → questions[]
  private flashcards: Map<string, any[]> = new Map();    // documentId → flashcards[]
  private embeddings: Map<string, number[][]> = new Map(); // documentId → embeddings[]

  private constructor() {}

  public static getInstance(): InMemoryStore {
    if (!InMemoryStore.instance) {
      InMemoryStore.instance = new InMemoryStore();
    }
    return InMemoryStore.instance;
  }

  // ── Documents ──────────────────────────────────────────

  addDocument(doc: any): void {
    this.documents.set(doc.id, { ...doc, uploadedAt: new Date() });
    this.logger.info(`[InMemory] Stored document: ${doc.title}`);
  }

  getDocument(id: string): any | null {
    return this.documents.get(id) || null;
  }

  getDocumentsByUser(userId: string): any[] {
    return Array.from(this.documents.values())
      .filter((d) => d.userId === userId)
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  findDocumentByHash(hash: string): any | null {
    return Array.from(this.documents.values()).find((d) => d.contentHash === hash) || null;
  }

  deleteDocument(id: string): void {
    this.documents.delete(id);
    this.chunks.delete(id);
    this.flashcards.delete(id);
    this.embeddings.delete(id);
    // Delete associated quizzes
    for (const [qId, quiz] of this.quizzes) {
      if (quiz.documentId === id) {
        this.quizzes.delete(qId);
        this.questions.delete(qId);
      }
    }
  }

  // ── Chunks ─────────────────────────────────────────────

  addChunks(documentId: string, chunkData: any[]): void {
    this.chunks.set(documentId, chunkData);
    this.logger.info(`[InMemory] Stored ${chunkData.length} chunks for ${documentId}`);
  }

  getChunks(documentId: string, limit?: number): any[] {
    const all = this.chunks.get(documentId) || [];
    return limit ? all.slice(0, limit) : all;
  }

  getAllChunks(limit?: number): any[] {
    const all = Array.from(this.chunks.values()).flat();
    return limit ? all.slice(0, limit) : all;
  }

  // ── Embeddings (for similarity search fallback) ────────

  addEmbeddings(documentId: string, vecs: number[][]): void {
    this.embeddings.set(documentId, vecs);
  }

  similaritySearch(queryVec: number[], topK: number, documentId?: string): string[] {
    let candidates: { content: string; score: number }[] = [];

    const searchDocs = documentId
      ? [[documentId, this.chunks.get(documentId) || []] as [string, any[]]]
      : Array.from(this.chunks.entries());

    for (const [docId, docChunks] of searchDocs) {
      const docEmbeddings = this.embeddings.get(docId);
      if (!docEmbeddings) continue;

      for (let i = 0; i < docChunks.length; i++) {
        if (!docEmbeddings[i]) continue;
        const score = this.cosineSimilarity(queryVec, docEmbeddings[i]);
        candidates.push({ content: docChunks[i].content, score });
      }
    }

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((c) => c.content);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }

  // ── Quizzes ────────────────────────────────────────────

  addQuiz(quiz: any): void {
    this.quizzes.set(quiz.id, { ...quiz, createdAt: new Date() });
  }

  getQuiz(id: string): any | null {
    const quiz = this.quizzes.get(id);
    if (!quiz) return null;
    return { ...quiz, questions: this.questions.get(id) || [] };
  }

  getQuizzesByDocument(documentId: string): any[] {
    return Array.from(this.quizzes.values())
      .filter((q) => q.documentId === documentId)
      .map((q) => ({ ...q, questions: this.questions.get(q.id) || [] }));
  }

  addQuestion(quizId: string, question: any): void {
    const existing = this.questions.get(quizId) || [];
    existing.push(question);
    this.questions.set(quizId, existing);
  }

  updateQuizScore(quizId: string, score: number): void {
    const quiz = this.quizzes.get(quizId);
    if (quiz) quiz.score = score;
  }

  // ── Flashcards ─────────────────────────────────────────

  addFlashcard(documentId: string, flashcard: any): void {
    const existing = this.flashcards.get(documentId) || [];
    existing.push({ ...flashcard, createdAt: new Date() });
    this.flashcards.set(documentId, existing);
  }

  getFlashcardsByDocument(documentId: string): any[] {
    return (this.flashcards.get(documentId) || []).sort(
      (a: any, b: any) => b.createdAt - a.createdAt
    );
  }

  deleteFlashcard(id: string): void {
    for (const [docId, cards] of this.flashcards) {
      const filtered = cards.filter((c: any) => c.id !== id);
      if (filtered.length !== cards.length) {
        this.flashcards.set(docId, filtered);
        return;
      }
    }
  }

  // ── Utility ────────────────────────────────────────────

  hasData(): boolean {
    return this.documents.size > 0;
  }

  getStats(): { documents: number; chunks: number; quizzes: number; flashcards: number } {
    return {
      documents: this.documents.size,
      chunks: Array.from(this.chunks.values()).reduce((s, c) => s + c.length, 0),
      quizzes: this.quizzes.size,
      flashcards: Array.from(this.flashcards.values()).reduce((s, c) => s + c.length, 0),
    };
  }
}

export const memoryStore = InMemoryStore.getInstance();
