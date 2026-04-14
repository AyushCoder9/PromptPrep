import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import AnimatedPage from "../components/AnimatedPage";
import Icon from "../components/Icon";

const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const ITEM_VARIANT: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [documents, setDocuments] = useState<
    { id: string; title: string; chunkCount: number; uploadedAt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getDocuments()
      .then((res) => setDocuments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDocs = documents.length;
  const totalChunks = documents.reduce((s, d) => s + (d.chunkCount || 0), 0);

  return (
    <AnimatedPage className="dashboard-wrapper">
      <div className="page-header page-header-row">
        <div>
          <h1>Dashboard</h1>
          <p>Documents you upload are chunked, embedded, and ready for quizzes, cards, and chat.</p>
        </div>
        <div className="inline-row">
          <button type="button" className="btn btn-primary" onClick={() => navigate("/upload")}>
            <Icon name="upload" size={18} />
            Upload
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/demo")}>
            <Icon name="demo" size={18} />
            Demo
          </button>
        </div>
      </div>

      <motion.div 
        className="stats-row"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={ITEM_VARIANT} whileHover={{ y: -4, scale: 1.02 }} className="stat-card">
          <div className="stat-card-icon accent">
            <Icon name="document" size={20} />
          </div>
          <div className="stat-card-info">
            <h3>{totalDocs}</h3>
            <p>Documents</p>
          </div>
        </motion.div>
        <motion.div variants={ITEM_VARIANT} whileHover={{ y: -4, scale: 1.02 }} className="stat-card">
          <div className="stat-card-icon success">
            <Icon name="layers" size={20} />
          </div>
          <div className="stat-card-info">
            <h3>{totalChunks}</h3>
            <p>Indexed chunks</p>
          </div>
        </motion.div>
        <motion.div variants={ITEM_VARIANT} whileHover={{ y: -4, scale: 1.02 }} className="stat-card">
          <div className="stat-card-icon">
            <Icon name="quiz" size={20} />
          </div>
          <div className="stat-card-info">
            <h3>—</h3>
            <p>Quizzes (session)</p>
          </div>
        </motion.div>
        <motion.div variants={ITEM_VARIANT} whileHover={{ y: -4, scale: 1.02 }} className="stat-card">
          <div className="stat-card-icon warning">
            <Icon name="flashcards" size={20} />
          </div>
          <div className="stat-card-info">
            <h3>—</h3>
            <p>Flashcards (session)</p>
          </div>
        </motion.div>
      </motion.div>

      <h2 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "14px" }}>
        Recent documents
      </h2>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <span className="muted">Loading library…</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-visual" aria-hidden>
            <Icon name="folder" size={22} />
          </div>
          <h3>No documents yet</h3>
          <p>Add a PDF or text file to start studying.</p>
        </div>
      ) : (
        <motion.div 
          className="stack-gap"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
        >
          {documents.slice(0, 5).map((doc) => (
            <motion.div variants={ITEM_VARIANT} key={doc.id} className="doc-item">
              <div className="doc-item-left">
                <div className="doc-icon" aria-hidden>
                  <Icon name="file" size={18} />
                </div>
                <div className="doc-item-info">
                  <h4>{doc.title}</h4>
                  <p>
                    {doc.chunkCount} chunks · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="doc-item-actions">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => navigate(`/quiz?doc=${doc.id}`)}>
                  <Icon name="quiz" size={16} />
                  Quiz
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate(`/flashcards?doc=${doc.id}`)}
                >
                  <Icon name="flashcards" size={16} />
                  Cards
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatedPage>
  );
}
