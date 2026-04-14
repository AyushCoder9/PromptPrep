import { useState } from "react";
import Icon from "../components/Icon";

const DEMO_DOCUMENT_TEXT = `Machine Learning is a subset of Artificial Intelligence that enables systems to learn from data and improve from experience without being explicitly programmed. 

Supervised Learning uses labeled data to train models. Common algorithms include Linear Regression for continuous outputs and Logistic Regression for classification tasks. Decision Trees split data based on feature values, while Random Forests combine multiple trees for better accuracy.

Unsupervised Learning works with unlabeled data to find hidden patterns. K-Means Clustering groups similar data points into K clusters. Principal Component Analysis (PCA) reduces dimensionality while preserving variance.

Neural Networks are inspired by biological neurons. A perceptron is the simplest unit, taking weighted inputs and applying an activation function. Deep Learning uses multiple hidden layers to learn complex representations. Convolutional Neural Networks (CNNs) excel at image recognition, while Recurrent Neural Networks (RNNs) handle sequential data like text.

Overfitting occurs when a model performs well on training data but poorly on unseen data. Regularization techniques like L1 (Lasso) and L2 (Ridge) add penalties to prevent overfitting. Cross-validation splits data into folds to evaluate model performance more reliably.

Gradient Descent is an optimization algorithm that minimizes the loss function by iteratively adjusting model parameters. The learning rate controls step size — too large causes divergence, too small causes slow convergence. Stochastic Gradient Descent (SGD) uses random subsets for faster updates.`;

const DEMO_PARSED_CHUNKS = [
  "Machine Learning is a subset of Artificial Intelligence that enables systems to learn from data and improve from experience without being explicitly programmed.",
  "Supervised Learning uses labeled data to train models. Common algorithms include Linear Regression for continuous outputs and Logistic Regression for classification tasks. Decision Trees split data based on feature values, while Random Forests combine multiple trees for better accuracy.",
  "Unsupervised Learning works with unlabeled data to find hidden patterns. K-Means Clustering groups similar data points into K clusters. Principal Component Analysis (PCA) reduces dimensionality while preserving variance.",
  "Neural Networks are inspired by biological neurons. A perceptron is the simplest unit, taking weighted inputs and applying an activation function. Deep Learning uses multiple hidden layers to learn complex representations.",
  "Convolutional Neural Networks (CNNs) excel at image recognition, while Recurrent Neural Networks (RNNs) handle sequential data like text.",
  "Overfitting occurs when a model performs well on training data but poorly on unseen data. Regularization techniques like L1 (Lasso) and L2 (Ridge) add penalties to prevent overfitting.",
  "Gradient Descent is an optimization algorithm that minimizes the loss function by iteratively adjusting model parameters. The learning rate controls step size.",
];

const DEMO_QUIZ = [
  {
    text: "What is Machine Learning?",
    options: [
      "A) A type of database management system",
      "B) A subset of AI that enables systems to learn from data",
      "C) A programming language for data analysis",
      "D) A hardware component for computing",
    ],
    correctAnswer: "B) A subset of AI that enables systems to learn from data",
    explanation:
      "Machine Learning is defined as a subset of Artificial Intelligence that enables systems to learn from data and improve from experience without being explicitly programmed.",
  },
  {
    text: "Which algorithm is used for classification tasks in Supervised Learning?",
    options: [
      "A) K-Means Clustering",
      "B) Principal Component Analysis",
      "C) Logistic Regression",
      "D) Gradient Descent",
    ],
    correctAnswer: "C) Logistic Regression",
    explanation:
      "Logistic Regression is commonly used for classification tasks in Supervised Learning, unlike Linear Regression which is used for continuous outputs.",
  },
  {
    text: "What does PCA stand for and what does it do?",
    options: [
      "A) Primary Clustering Algorithm — clusters data points",
      "B) Principal Component Analysis — reduces dimensionality while preserving variance",
      "C) Predicted Classification Accuracy — measures model performance",
      "D) Parallel Computing Architecture — speeds up training",
    ],
    correctAnswer: "B) Principal Component Analysis — reduces dimensionality while preserving variance",
    explanation:
      "PCA (Principal Component Analysis) is an unsupervised technique that reduces the dimensionality of data while preserving as much variance as possible.",
  },
  {
    text: "What is overfitting?",
    options: [
      "A) When a model is too simple to capture patterns",
      "B) When a model performs well on training data but poorly on unseen data",
      "C) When the dataset is too large to process",
      "D) When the learning rate is set too high",
    ],
    correctAnswer: "B) When a model performs well on training data but poorly on unseen data",
    explanation:
      "Overfitting occurs when a model learns the training data too well, including noise, and fails to generalize to new unseen data.",
  },
  {
    text: "Which type of neural network is best suited for image recognition?",
    options: [
      "A) Recurrent Neural Networks (RNNs)",
      "B) Generative Adversarial Networks (GANs)",
      "C) Convolutional Neural Networks (CNNs)",
      "D) Simple Perceptrons",
    ],
    correctAnswer: "C) Convolutional Neural Networks (CNNs)",
    explanation: "CNNs are specifically designed for processing grid-like data such as images, using convolutional layers to detect spatial features.",
  },
];

const DEMO_FLASHCARDS = [
  { term: "Machine Learning", definition: "A subset of AI that enables systems to learn from data and improve from experience without being explicitly programmed." },
  { term: "Supervised Learning", definition: "A type of ML that uses labeled data to train models, where the correct output is known for each input." },
  { term: "Unsupervised Learning", definition: "ML approach that works with unlabeled data to find hidden patterns and structures." },
  { term: "Overfitting", definition: "When a model performs well on training data but poorly on unseen data, indicating it has memorized rather than learned." },
  { term: "Neural Network", definition: "A computing system inspired by biological neurons, consisting of interconnected nodes that process information." },
  { term: "Gradient Descent", definition: "An optimization algorithm that minimizes the loss function by iteratively adjusting model parameters in the direction of steepest descent." },
  { term: "CNN", definition: "Convolutional Neural Network — a deep learning architecture that excels at processing grid-like data such as images." },
  { term: "Regularization", definition: "Techniques like L1 (Lasso) and L2 (Ridge) that add penalties to model complexity to prevent overfitting." },
];

const DEMO_QA = [
  {
    q: "What is the difference between supervised and unsupervised learning?",
    a: "Supervised Learning uses labeled data where each training example has a known correct output. It's used for tasks like classification (Logistic Regression) and regression (Linear Regression). Unsupervised Learning works with unlabeled data — the algorithm must find hidden patterns on its own. Examples include K-Means Clustering for grouping similar data points and PCA for dimensionality reduction.",
  },
  {
    q: "How does gradient descent work?",
    a: "Gradient Descent is an optimization algorithm that minimizes the loss function by iteratively adjusting model parameters. It calculates the gradient (slope) of the loss function and moves the parameters in the opposite direction. The learning rate controls the step size — too large causes the algorithm to overshoot (diverge), while too small makes convergence very slow. Stochastic Gradient Descent (SGD) is a variant that uses random data subsets for faster parameter updates.",
  },
  {
    q: "What causes overfitting and how can it be prevented?",
    a: "Overfitting happens when a model learns the training data too well, including its noise and outliers, resulting in poor performance on new data. Prevention techniques include: (1) Regularization — L1 (Lasso) adds absolute value penalties, L2 (Ridge) adds squared penalties to the loss function; (2) Cross-validation — splitting data into multiple folds to evaluate model performance more reliably; (3) Using simpler models or reducing the number of features.",
  },
];

type DemoStep = "upload" | "parse" | "quiz" | "flashcards" | "chat";

export default function Demo() {
  const [activeStep, setActiveStep] = useState<DemoStep>("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Sample ML notes are loaded. Ask a question below." },
  ]);
  const [chatInput, setChatInput] = useState("");

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadDone(true);
          return 100;
        }
        return p + 4;
      });
    }, 50);
  };

  const handleQuizAnswer = (option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers({ ...quizAnswers, [quizIndex]: option });
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userQ = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userQ }]);

    const match = DEMO_QA.find((qa) => userQ.toLowerCase().includes(qa.q.toLowerCase().split(" ").slice(0, 3).join(" ").toLowerCase()));
    const answer = match
      ? match.a
      : "Based on the uploaded study material, Machine Learning is a subset of AI that enables systems to learn from data. The material covers Supervised Learning (using labeled data), Unsupervised Learning (finding patterns in unlabeled data), Neural Networks, and optimization techniques like Gradient Descent. Would you like me to elaborate on any specific topic?";

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    }, 800);
  };

  const steps: { key: DemoStep; label: string; num: string }[] = [
    { key: "upload", label: "Upload", num: "1" },
    { key: "parse", label: "Parse & index", num: "2" },
    { key: "quiz", label: "Quiz", num: "3" },
    { key: "flashcards", label: "Flashcards", num: "4" },
    { key: "chat", label: "Chat", num: "5" },
  ];

  const quizScore = quizSubmitted
    ? DEMO_QUIZ.reduce((s, q, i) => s + (quizAnswers[i] === q.correctAnswer ? 1 : 0), 0)
    : null;

  const pct = quizScore !== null ? Math.round((quizScore / DEMO_QUIZ.length) * 100) : 0;
  const quizFeedback = quizScore === DEMO_QUIZ.length ? "Perfect score" : quizScore !== null && quizScore >= 3 ? "Good progress" : "Review the deck";

  return (
    <div className="animate-in">
      <div className="demo-hero">
        <h1>Product demo</h1>
        <p>
          Walkthrough without an API key: upload → chunking → quiz, flashcards, and Q&amp;A—the same flows as the live app.
        </p>
      </div>

      <div className="demo-steps">
        {steps.map((step) => (
          <button key={step.key} type="button" className={`demo-step ${activeStep === step.key ? "active" : ""}`} onClick={() => setActiveStep(step.key)}>
            <span className="demo-step-num">{step.num}</span>
            {step.label}
          </button>
        ))}
      </div>

      {activeStep === "upload" && (
        <div className="demo-panel animate-in">
          <h2>Step 1 · Simulated upload</h2>
          <p className="muted" style={{ marginBottom: "20px" }}>
            In production you&apos;d upload your file. Here we use a fixed Machine Learning excerpt.
          </p>

          <div className="card" style={{ textAlign: "center", padding: "28px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 14px",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
              aria-hidden
            >
              <Icon name="file" size={26} />
            </div>
            <h3 style={{ marginBottom: "4px", fontSize: "15px", fontWeight: 600 }}>machine_learning_notes.pdf</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Sample · 6 pages · PDF</p>

            {!isUploading && !uploadDone && (
              <button type="button" className="btn btn-primary btn-lg" onClick={simulateUpload}>
                <Icon name="upload" size={18} />
                Run upload simulation
              </button>
            )}

            {isUploading && (
              <div>
                <div className="quiz-progress-bar" style={{ marginBottom: "12px" }}>
                  <div className="quiz-progress-fill" style={{ width: `${uploadProgress}%`, transition: "width 0.1s" }} />
                </div>
                <p className="muted" style={{ fontSize: "13px" }}>
                  {uploadProgress < 30
                    ? "Reading…"
                    : uploadProgress < 60
                      ? "Extracting text…"
                      : uploadProgress < 85
                        ? "Chunking & embedding…"
                        : "Indexing…"}
                </p>
              </div>
            )}

            {uploadDone && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--success-bg)",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--success)",
                  }}
                  aria-hidden
                >
                  <Icon name="check" size={22} />
                </div>
                <p style={{ fontWeight: 600 }}>Indexed</p>
                <div className="inline-row" style={{ gap: "8px" }}>
                  <span className="badge badge-purple">7 chunks</span>
                  <span className="badge badge-green">Ready</span>
                </div>
                <button type="button" className="btn btn-secondary" style={{ marginTop: "8px" }} onClick={() => setActiveStep("parse")}>
                  Parse &amp; index
                  <Icon name="arrowRight" size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeStep === "parse" && (
        <div className="demo-panel animate-in">
          <h2>Step 2 · Parse &amp; index</h2>
          <p className="muted" style={{ marginBottom: "20px" }}>
            Text is split into overlapping chunks, embedded, and stored for semantic retrieval.
          </p>

          <div className="demo-split">
            <div className="card">
              <h3 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)" }}>Extracted text</h3>
              <div className="demo-code-block">{DEMO_DOCUMENT_TEXT}</div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)" }}>
                Chunks ({DEMO_PARSED_CHUNKS.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflow: "auto" }}>
                {DEMO_PARSED_CHUNKS.map((chunk, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--bg-base)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 12px",
                      fontSize: "12px",
                      lineHeight: 1.6,
                      borderLeft: "3px solid var(--accent)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span className="badge badge-purple" style={{ marginBottom: "6px" }}>
                      {i + 1}
                    </span>
                    <p style={{ marginTop: "6px" }}>{chunk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Pipeline</h3>
            <div className="inline-row" style={{ gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <span className="badge badge-purple">PDF</span>
              <span aria-hidden>→</span>
              <span className="badge badge-amber">Parser</span>
              <span aria-hidden>→</span>
              <span className="badge badge-green">Chunker</span>
              <span aria-hidden>→</span>
              <span className="badge badge-purple">Embeddings</span>
              <span aria-hidden>→</span>
              <span className="badge badge-amber">Vector store</span>
              <span aria-hidden>→</span>
              <span className="badge badge-green">RAG</span>
            </div>
          </div>

          <button type="button" className="btn btn-primary" style={{ marginTop: "16px" }} onClick={() => setActiveStep("quiz")}>
            Try quiz
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
      )}

      {activeStep === "quiz" && (
        <div className="demo-panel animate-in">
          <h2>Step 3 · Quiz</h2>
          <p className="muted" style={{ marginBottom: "20px" }}>
            Questions are representative of what the backend generates from retrieved context.
          </p>

          {!quizSubmitted && (
            <div style={{ maxWidth: "640px" }}>
              <div className="quiz-progress">
                <div className="quiz-progress-bar">
                  <div className="quiz-progress-fill" style={{ width: `${((quizIndex + 1) / DEMO_QUIZ.length) * 100}%` }} />
                </div>
                <span className="quiz-progress-text">
                  {quizIndex + 1} / {DEMO_QUIZ.length}
                </span>
              </div>

              <div className="quiz-question card">
                <h2 style={{ fontSize: "17px" }}>{DEMO_QUIZ[quizIndex].text}</h2>
                <div className="quiz-options">
                  {DEMO_QUIZ[quizIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`quiz-option ${quizAnswers[quizIndex] === opt ? "selected" : ""}`}
                      onClick={() => handleQuizAnswer(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setQuizIndex(Math.max(0, quizIndex - 1))} disabled={quizIndex === 0}>
                  <Icon name="arrowLeft" size={18} />
                  Back
                </button>
                {quizIndex < DEMO_QUIZ.length - 1 ? (
                  <button type="button" className="btn btn-primary" onClick={() => setQuizIndex(quizIndex + 1)} disabled={!quizAnswers[quizIndex]}>
                    Next
                    <Icon name="arrowRight" size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length < DEMO_QUIZ.length}
                  >
                    <Icon name="check" size={18} />
                    Submit
                  </button>
                )}
              </div>
            </div>
          )}

          {quizSubmitted && quizScore !== null && (
            <div style={{ maxWidth: "640px" }}>
              <div className="score-display">
                <div className={`score-circle ${pct >= 70 ? "good" : pct >= 40 ? "ok" : "bad"}`}>{pct}%</div>
                <h2 style={{ fontSize: "19px", fontWeight: 600, marginBottom: "6px", letterSpacing: "-0.02em" }}>{quizFeedback}</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {quizScore} / {DEMO_QUIZ.length} correct
                </p>
              </div>

              <div className="stack-gap" style={{ marginTop: "20px" }}>
                {DEMO_QUIZ.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-raised)",
                      borderRadius: "var(--radius-md)",
                      borderLeft: `3px solid ${quizAnswers[i] === q.correctAnswer ? "var(--success)" : "var(--error)"}`,
                    }}
                  >
                    <p style={{ fontWeight: 600, fontSize: "13px", lineHeight: 1.45 }}>{q.text}</p>
                    <p style={{ fontSize: "12px", color: quizAnswers[i] === q.correctAnswer ? "var(--success)" : "var(--error)", marginTop: "6px" }}>
                      Your answer: {quizAnswers[i]}{" "}
                      <span style={{ fontWeight: 600 }}>{quizAnswers[i] === q.correctAnswer ? "(correct)" : "(incorrect)"}</span>
                    </p>
                    {quizAnswers[i] !== q.correctAnswer && <p style={{ fontSize: "12px", color: "var(--success)", marginTop: "4px" }}>Answer: {q.correctAnswer}</p>}
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.5 }}>{q.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="inline-row" style={{ marginTop: "20px", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                    setQuizIndex(0);
                  }}
                >
                  Retry
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setActiveStep("flashcards")}>
                  Flashcards
                  <Icon name="arrowRight" size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeStep === "flashcards" && (
        <div className="demo-panel animate-in">
          <h2>Step 4 · Flashcards</h2>
          <p className="muted" style={{ marginBottom: "20px" }}>
            Flip cards to reveal definitions—same interaction as the live flashcard view.
          </p>

          <div className="flashcard-viewer">
            <div className="quiz-progress" style={{ width: "100%", maxWidth: "480px" }}>
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${((fcIndex + 1) / DEMO_FLASHCARDS.length) * 100}%` }} />
              </div>
              <span className="quiz-progress-text">
                {fcIndex + 1} / {DEMO_FLASHCARDS.length}
              </span>
            </div>

            <div
              className={`flashcard ${fcFlipped ? "flipped" : ""}`}
              onClick={() => setFcFlipped(!fcFlipped)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFcFlipped(!fcFlipped);
                }
              }}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <span className="flashcard-label">Term</span>
                  <span className="flashcard-text">{DEMO_FLASHCARDS[fcIndex].term}</span>
                  <p className="muted" style={{ fontSize: "12px", marginTop: "18px" }}>
                    Click to flip
                  </p>
                </div>
                <div className="flashcard-back">
                  <span className="flashcard-label">Definition</span>
                  <span className="flashcard-text">{DEMO_FLASHCARDS[fcIndex].definition}</span>
                </div>
              </div>
            </div>

            <div className="flashcard-nav">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setFcFlipped(false);
                  setTimeout(() => setFcIndex(Math.max(0, fcIndex - 1)), 150);
                }}
                disabled={fcIndex === 0}
              >
                <Icon name="arrowLeft" size={18} />
                Prev
              </button>
              <span className="flashcard-counter">
                {fcIndex + 1} · {DEMO_FLASHCARDS.length}
              </span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setFcFlipped(false);
                  setTimeout(() => setFcIndex(Math.min(DEMO_FLASHCARDS.length - 1, fcIndex + 1)), 150);
                }}
                disabled={fcIndex === DEMO_FLASHCARDS.length - 1}
              >
                Next
                <Icon name="arrowRight" size={18} />
              </button>
            </div>

            <button type="button" className="btn btn-primary" style={{ marginTop: "8px" }} onClick={() => setActiveStep("chat")}>
              Chat
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </div>
      )}

      {activeStep === "chat" && (
        <div className="demo-panel animate-in">
          <h2>Step 5 · Chat</h2>
          <p className="muted" style={{ marginBottom: "16px" }}>
            Suggested prompts use canned answers; the real app calls your RAG endpoint.
          </p>

          <div style={{ maxWidth: "700px" }}>
            <div style={{ marginBottom: "12px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Try:</span>
              {DEMO_QA.map((qa, i) => (
                <button key={i} type="button" className="btn btn-sm btn-secondary" style={{ fontSize: "12px" }} onClick={() => setChatInput(qa.q)}>
                  {qa.q.length > 36 ? `${qa.q.slice(0, 36)}…` : qa.q}
                </button>
              ))}
            </div>

            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-lg)",
                padding: "16px",
                maxHeight: "340px",
                overflow: "auto",
                marginBottom: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                border: "1px solid var(--border)",
              }}
            >
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <div className="chat-avatar" aria-hidden>
                    {msg.role === "assistant" ? <Icon name="bot" size={16} /> : <Icon name="user" size={16} />}
                  </div>
                  <div className="chat-bubble">{msg.content}</div>
                </div>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                className="input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChatSend();
                }}
                placeholder="Ask about the sample notes…"
                aria-label="Chat message"
              />
              <button type="button" className="btn btn-primary" onClick={handleChatSend}>
                <Icon name="send" size={18} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
