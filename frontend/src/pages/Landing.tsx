import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import AnimatedPage from "../components/AnimatedPage";
import Icon from "../components/Icon";

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(5px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
};

const features = [
  {
    title: "Ingest anything",
    text: "PDFs and plain text chunked, embedded, and indexed for semantic search.",
    icon: "upload" as const,
  },
  {
    title: "Quizzes & cards",
    text: "Multiple-choice sets and flip cards generated from your actual material.",
    icon: "quiz" as const,
  },
  {
    title: "Grounded chat",
    text: "Ask questions and get answers tied to your uploads—not generic web fluff.",
    icon: "chat" as const,
  },
];

const workflowSteps = [
  { step: "01", title: "Upload Notes", text: "Drag and drop your PDFs, lectures, or paste raw text." },
  { step: "02", title: "AI Parsing", text: "We instantly process and split your content into semantic chunks." },
  { step: "03", title: "Vector Indexing", text: "Chunks are embedded and mapped perfectly using ChromaDB." },
  { step: "04", title: "Study & Chat", text: "Generate flashcards, quizzes, or context-aware chat replies." }
];

const techStack = [
  { name: "React 18", type: "Frontend Library", icon: "react" },
  { name: "Framer Motion", type: "UI Physics & Animation", icon: "sparkle" },
  { name: "Express.js REST", type: "Backend API routing", icon: "server" },
  { name: "Prisma & SQLite", type: "Relational Database", icon: "database" },
  { name: "ChromaDB", type: "Vector Distance Search", icon: "layers" },
  { name: "Google Gemini", type: "Generative AI", icon: "bot" },
  { name: "RAG Pipeline", type: "Retrieval-Augmented Gen", icon: "network" },
  { name: "Semantic Chunking", type: "Text Split Algorithm", icon: "document" },
  { name: "Vector Embeddings", type: "Document Embed Model", icon: "cpu" }
];

export default function Landing() {
  return (
    <AnimatedPage className="landing">
      <div className="landing-bg" aria-hidden>
        <div className="landing-bg__grid" />
        <div className="landing-bg__orb landing-bg__orb--1" />
        <div className="landing-bg__orb landing-bg__orb--2" />
        <div className="landing-bg__orb landing-bg__orb--3" />
      </div>

      <header className="landing-nav">
        <Link to="/" className="landing-nav__brand">
          <span className="landing-nav__mark" aria-hidden>
            <Icon name="logo" size={20} />
          </span>
          <span className="landing-nav__title">PromptPrep</span>
        </Link>
        {/* Navbar links removed as requested */}
      </header>

      <main className="landing-main">
        <motion.section 
          className="landing-hero"
          variants={STAGGER}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={FADE_UP} className="landing-hero__eyebrow">RAG · Study tooling</motion.p>
          <motion.h1 variants={FADE_UP} className="landing-hero__headline">
            Study material that actually knows your notes.
          </motion.h1>
          <motion.p variants={FADE_UP} className="landing-hero__tagline">
            Upload once. Practice with AI-built quizzes and flashcards, or chat with retrieval grounded in what you added.
          </motion.p>
          <motion.div variants={FADE_UP} className="landing-hero__actions">
            <Link to="/upload" className="landing-btn landing-btn--primary">
              Get started
              <Icon name="arrowRight" size={18} />
            </Link>
            <Link to="/demo" className="landing-btn landing-btn--outline">
              <Icon name="demo" size={18} />
              Try the demo
            </Link>
          </motion.div>
        </motion.section>

        <motion.section 
          className="landing-features" 
          aria-labelledby="landing-features-title"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={STAGGER}
        >
          <motion.h2 variants={FADE_UP} id="landing-features-title" className="landing-features__title">
            Built for focus
          </motion.h2>
          <div className="landing-feature-grid">
            {features.map((f) => (
              <motion.article 
                key={f.title} 
                variants={FADE_UP}
                whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
                className="landing-card"
              >
                <div className="landing-card__icon" aria-hidden>
                   <Icon name={f.icon} size={22} />
                </div>
                <h3 className="landing-card__title">{f.title}</h3>
                <p className="landing-card__text">{f.text}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="landing-workflow" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={STAGGER}
        >
          <motion.h2 variants={FADE_UP} className="landing-features__title">
            How It Works
          </motion.h2>
          <div className="workflow-timeline">
            {workflowSteps.map((w, i) => (
              <motion.div key={w.step} variants={FADE_UP} className="workflow-step">
                <div className="workflow-step__marker">
                  <span className="workflow-step__number">{w.step}</span>
                  {i < workflowSteps.length - 1 && <div className="workflow-step__line" />}
                </div>
                <div className="workflow-step__content">
                  <h3 className="workflow-step__title">{w.title}</h3>
                  <p className="workflow-step__text">{w.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="landing-tech" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={STAGGER}
        >
          <motion.h2 variants={FADE_UP} className="landing-features__title">
            Built With Modern Tech
          </motion.h2>
          <div className="tech-grid">
            {techStack.map((tech) => (
              <motion.div 
                key={tech.name} 
                variants={FADE_UP}
                whileHover={{ y: -5, scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                className="tech-card"
              >
                <div className="tech-card__icon">
                  <Icon name={tech.icon as any} size={24} />
                </div>
                <div className="tech-card__info">
                  <h4 className="tech-card__name">{tech.name}</h4>
                  <span className="tech-card__type">{tech.type}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.footer 
          className="landing-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link to="/dashboard" className="landing-footer__link">
            Open workspace
            <Icon name="arrowRight" size={16} />
          </Link>
        </motion.footer>
      </main>
    </AnimatedPage>
  );
}
