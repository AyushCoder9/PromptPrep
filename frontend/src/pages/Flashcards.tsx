import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedPage from "../components/AnimatedPage";
import Icon from "../components/Icon";

interface FlashcardData {
  term: string;
  definition: string;
}

export default function Flashcards() {
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("doc") || "";

  const [documents, setDocuments] = useState<{ id: string; title: string }[]>([]);
  const [selectedDoc, setSelectedDoc] = useState(docId);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDocuments().then((res) => setDocuments(res.data || [])).catch(() => {});
  }, []);

  const generateCards = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    setError("");
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);

    try {
      const res = await api.generateFlashcards(selectedDoc, { count: 10 });
      setCards(res.data || []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((p) => Math.min(p + 1, cards.length - 1)), 150);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((p) => Math.max(p - 1, 0)), 150);
  };

  return (
    <AnimatedPage className="flashcards-wrapper">
      <div className="page-header">
        <h1>Flashcards</h1>
        <p>Terms and definitions pulled from your indexed content.</p>
      </div>

      {cards.length === 0 && !loading && (
        <div className="card" style={{ maxWidth: "480px" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="fc-doc">
              Document
            </label>
            <select id="fc-doc" className="select" value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}>
              <option value="">Choose a document…</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={generateCards} disabled={!selectedDoc}>
            <Icon name="sparkle" size={18} />
            Generate set
          </button>
          {error && (
            <div className="callout callout-error" style={{ marginTop: "14px" }} role="alert">
              <span className="callout-icon" aria-hidden>
                <Icon name="alert" size={18} />
              </span>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span className="muted">Building flashcards…</span>
        </div>
      )}

      {cards.length > 0 && (
        <div className="flashcard-viewer">
          <div className="quiz-progress" style={{ width: "100%", maxWidth: "480px" }}>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
            </div>
            <span className="quiz-progress-text">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>

          <motion.div 
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`flashcard`} 
            onClick={() => setFlipped(!flipped)} 
            role="button" 
            tabIndex={0}
            style={{ transformStyle: "preserve-3d" }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped(!flipped); } }}
            aria-label={flipped ? "Show term" : "Show definition"}
          >
            <div className="flashcard-inner" style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}>
              <div className="flashcard-front" style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0 }}>
                <span className="flashcard-label">Term</span>
                <span className="flashcard-text">{cards[currentIndex].term}</span>
                <p className="muted" style={{ fontSize: "12px", marginTop: "18px" }}>
                  Click or press Space to flip
                </p>
              </div>
              <div className="flashcard-back" style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0, transform: "rotateY(180deg)" }}>
                <span className="flashcard-label">Definition</span>
                <span className="flashcard-text">{cards[currentIndex].definition}</span>
              </div>
            </div>
          </motion.div>

          <div className="flashcard-nav">
            <button type="button" className="btn btn-secondary" onClick={prev} disabled={currentIndex === 0}>
              <Icon name="arrowLeft" size={18} />
              Prev
            </button>
            <span className="flashcard-counter">
              {currentIndex + 1} · {cards.length}
            </span>
            <button type="button" className="btn btn-primary" onClick={next} disabled={currentIndex === cards.length - 1}>
              Next
              <Icon name="arrowRight" size={18} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setCards([]);
              setFlipped(false);
            }}
          >
            <Icon name="refresh" size={18} />
            New set
          </button>
        </div>
      )}
    </AnimatedPage>
  );
}
