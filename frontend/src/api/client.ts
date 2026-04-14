const API_BASE = "http://localhost:3001/api";

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Documents
  uploadDocument: async (file: File): Promise<ApiResponse<{ id: string; title: string; chunkCount: number }>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", "default-user");
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }
    return res.json();
  },

  getDocuments: () => request<any[]>("/documents?userId=default-user"),
  getDocument: (id: string) => request<any>(`/documents/${id}`),
  deleteDocument: (id: string) => request<void>(`/documents/${id}`, { method: "DELETE" }),

  // Quizzes
  generateQuiz: (documentId: string, options?: { difficulty?: string; count?: number; topic?: string }) =>
    request<any>("/quizzes/generate", {
      method: "POST",
      body: JSON.stringify({ documentId, ...options }),
    }),
  getQuiz: (id: string) => request<any>(`/quizzes/${id}`),
  submitQuiz: (id: string, answers: Record<string, string>) =>
    request<any>(`/quizzes/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  // Flashcards
  generateFlashcards: (documentId: string, options?: { count?: number; topic?: string }) =>
    request<any[]>("/flashcards/generate", {
      method: "POST",
      body: JSON.stringify({ documentId, ...options }),
    }),
  getFlashcards: (documentId: string) => request<any[]>(`/flashcards/document/${documentId}`),

  // Q&A
  askQuestion: (question: string, documentId?: string) =>
    request<{ answer: string; sources: string[] }>("/qa/ask", {
      method: "POST",
      body: JSON.stringify({ question, documentId }),
    }),

  // Health
  healthCheck: () => request<{ status: string }>("/health"),
};
