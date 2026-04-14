import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "../components/AnimatedPage";
import Icon from "../components/Icon";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("doc") || "";

  const [documents, setDocuments] = useState<{ id: string; title: string }[]>([]);
  const [selectedDoc, setSelectedDoc] = useState(docId);
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDocuments().then((res) => setDocuments(res.data || [])).catch(() => {});
  }, []);

  const generateQuiz = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setCurrentQ(0);

    try {
      const res = await api.generateQuiz(selectedDoc, { difficulty, count });
      setQuestions(res.data?.quiz?.questions || []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (optionIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [currentQ]: questions[currentQ].options[optionIndex] });
  };

  const submitQuiz = () => {
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
  };

  const pct = score !== null && questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const feedbackTitle =
    pct >= 70 ? "Solid work" : pct >= 40 ? "Keep going" : "Review and retry";

  return (
    <AnimatedPage className="quiz-wrapper">
      <div className="page-header">
        <h1>Quizzes</h1>
        <p>Multiple-choice questions generated from the chunks most relevant to your document.</p>
      </div>

      {questions.length === 0 && !loading && (
        <div className="card" style={{ maxWidth: "560px" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="quiz-doc">
              Document
            </label>
            <select id="quiz-doc" className="select" value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}>
              <option value="">Choose a document…</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="quiz-difficulty">
                Difficulty
              </label>
              <select
                id="quiz-difficulty"
                className="select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="quiz-count">
                Questions
              </label>
              <select id="quiz-count" className="select" value={count} onChange={(e) => setCount(+e.target.value)}>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>
          </div>

          <button type="button" className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={generateQuiz} disabled={!selectedDoc}>
            <Icon name="sparkle" size={18} />
            Generate quiz
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
          <span className="muted">Generating questions… This can take a short while.</span>
        </div>
      )}

      {questions.length > 0 && !submitted && (
        <div className="quiz-container">
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="quiz-progress-text">
              {currentQ + 1} / {questions.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="quiz-question card"
            >
              <h2>{questions[currentQ].text}</h2>
              <div className="quiz-options">
                {questions[currentQ].options.map((opt, i) => (
                  <motion.button
                    whileHover={{ scale: 1.015, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    key={i}
                    type="button"
                    className={`quiz-option ${answers[currentQ] === opt ? "selected" : ""}`}
                    onClick={() => selectAnswer(i)}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
            >
              <Icon name="arrowLeft" size={18} />
              Back
            </button>
            {currentQ < questions.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentQ(currentQ + 1)}
                disabled={!answers[currentQ]}
              >
                Next
                <Icon name="arrowRight" size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < questions.length}
              >
                <Icon name="check" size={18} />
                Submit
              </button>
            )}
          </div>
        </div>
      )}

      {submitted && score !== null && (
        <div className="card" style={{ maxWidth: "640px" }}>
          <div className="score-display">
            <div className={`score-circle ${pct >= 70 ? "good" : pct >= 40 ? "ok" : "bad"}`}>{pct}%</div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "6px", letterSpacing: "-0.02em" }}>{feedbackTitle}</h2>
            <p className="muted" style={{ margin: 0 }}>
              {score} of {questions.length} correct
            </p>
          </div>

          <div className="stack-gap" style={{ marginTop: "20px" }}>
            {questions.map((q, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  background: "var(--bg-raised)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: `3px solid ${answers[i] === q.correctAnswer ? "var(--success)" : "var(--error)"}`,
                }}
              >
                <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "6px", lineHeight: 1.45 }}>{q.text}</p>
                <p style={{ fontSize: "13px", color: answers[i] === q.correctAnswer ? "var(--success)" : "var(--error)" }}>
                  Your answer: {answers[i] || "—"}{" "}
                  <span style={{ fontWeight: 600 }}>{answers[i] === q.correctAnswer ? "(correct)" : "(incorrect)"}</span>
                </p>
                {answers[i] !== q.correctAnswer && (
                  <p style={{ fontSize: "13px", color: "var(--success)", marginTop: "4px" }}>Answer: {q.correctAnswer}</p>
                )}
                {q.explanation && (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.5 }}>{q.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "20px" }}
            onClick={() => {
              setQuestions([]);
              setSubmitted(false);
              setScore(null);
            }}
          >
            New quiz
          </button>
        </div>
      )}
    </AnimatedPage>
  );
}
