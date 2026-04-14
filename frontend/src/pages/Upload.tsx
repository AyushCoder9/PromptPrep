import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import AnimatedPage from "../components/AnimatedPage";
import Icon from "../components/Icon";

export default function Upload() {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ id: string; title: string; chunkCount: number } | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    setResult(null);
    setUploading(true);

    try {
      const res = await api.uploadDocument(file);
      setResult(res.data!);
    } catch (err: unknown) {
      setError((err as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleTextUpload = () => {
    if (!pastedText.trim()) {
      setError("Please enter some text to upload.");
      return;
    }
    const title = textTitle.trim() || "Pasted_Notes";
    const blob = new Blob([pastedText], { type: "text/plain" });
    const file = new File([blob], `${title}.txt`, { type: "text/plain" });
    handleFile(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (activeTab !== "file") return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (activeTab === "file") setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <AnimatedPage className="upload-wrapper">
      <div className="page-header">
        <h1>Upload</h1>
        <p>PDF, plain text, or Markdown — we parse, chunk, and index for retrieval.</p>
      </div>

      <div className="segmented" style={{ marginBottom: "20px" }} role="tablist" aria-label="Upload method">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "file"}
          className={activeTab === "file" ? "active" : ""}
          onClick={() => setActiveTab("file")}
          disabled={uploading}
        >
          <Icon name="file" size={16} />
          File
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "text"}
          className={activeTab === "text" ? "active" : ""}
          onClick={() => setActiveTab("text")}
          disabled={uploading}
        >
          <Icon name="clipboard" size={16} />
          Paste text
        </button>
      </div>

      {activeTab === "file" ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          animate={{
            borderColor: dragging ? "var(--accent)" : "var(--border-strong)",
            background: dragging ? "rgba(59, 130, 246, 0.08)" : "var(--bg-surface)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`upload-zone ${dragging ? "dragover" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={uploading ? { pointerEvents: "none", opacity: 0.72 } : {}}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            onChange={onFileSelect}
            style={{ display: "none" }}
          />

          {uploading ? (
            <div className="loading-overlay" style={{ padding: "24px" }}>
              <div className="spinner" />
              <span className="muted">Parsing, chunking, and indexing…</span>
            </div>
          ) : (
            <>
              <div className="upload-zone-icon-wrap" aria-hidden>
                <Icon name="upload" size={26} />
              </div>
              <h3>Drop a file here</h3>
              <p>or click to browse · PDF, TXT, MD · up to 50MB</p>
            </>
          )}
        </motion.div>
      ) : (
        <div className="card" style={{ padding: "24px" }}>
          {uploading ? (
            <div className="loading-overlay" style={{ minHeight: "260px", justifyContent: "center" }}>
              <div className="spinner" />
              <span className="muted">Processing…</span>
            </div>
          ) : (
            <div className="stack-gap" style={{ gap: "18px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="upload-title">
                  Title (optional)
                </label>
                <input
                  id="upload-title"
                  type="text"
                  className="input"
                  placeholder="e.g. Biology — Chapter 4"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="upload-body">
                  Content
                </label>
                <textarea
                  id="upload-body"
                  className="input textarea"
                  placeholder="Paste notes or articles here…"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  style={{ minHeight: "220px" }}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTextUpload}
                disabled={!pastedText.trim()}
                style={{ alignSelf: "flex-end" }}
              >
                <Icon name="upload" size={18} />
                Ingest text
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="callout callout-error" style={{ marginTop: "16px" }} role="alert">
          <span className="callout-icon" aria-hidden>
            <Icon name="alert" size={18} />
          </span>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="card" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "var(--success-bg)",
                border: "1px solid rgba(52, 211, 153, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success)",
                flexShrink: 0,
              }}
              aria-hidden
            >
              <Icon name="check" size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "4px" }}>
                Ready to study
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                {result.title}
              </p>
            </div>
          </div>
          <div className="inline-row" style={{ gap: "8px" }}>
            <span className="badge badge-purple">{result.chunkCount} chunks</span>
            <span className="badge badge-green">Indexed</span>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "14px", letterSpacing: "-0.02em" }}>
          How it works
        </h3>
        <div className="stack-gap" style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          <div className="inline-row" style={{ gap: "10px", alignItems: "flex-start" }}>
            <span className="badge badge-purple">1</span>
            <span>Upload a file or paste content.</span>
          </div>
          <div className="inline-row" style={{ gap: "10px", alignItems: "flex-start" }}>
            <span className="badge badge-purple">2</span>
            <span>We extract text, split into chunks, and store embeddings for search.</span>
          </div>
          <div className="inline-row" style={{ gap: "10px", alignItems: "flex-start" }}>
            <span className="badge badge-purple">3</span>
            <span>Use quizzes, flashcards, or RAG chat on top of your material.</span>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
