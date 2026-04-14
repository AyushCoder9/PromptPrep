import { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "../components/AnimatedPage";
import Icon from "../components/Icon";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [documents, setDocuments] = useState<{ id: string; title: string }[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Select a document or leave \"All documents\" and ask a question. Answers use retrieval from your library.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getDocuments().then((res) => setDocuments(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.askQuestion(userMsg, selectedDoc || undefined);
      setMessages((prev) => [...prev, { role: "assistant", content: res.data?.answer || "No answer returned." }]);
    } catch (err: unknown) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${(err as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatedPage className="chat-wrapper">
      <div className="page-header">
        <h1>Chat</h1>
        <div className="inline-row" style={{ marginTop: "10px" }}>
          <label htmlFor="chat-scope" className="sr-only">
            Document scope
          </label>
          <select id="chat-scope" className="select" style={{ maxWidth: "280px" }} value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}>
            <option value="">All documents</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
          <span className="badge badge-purple">RAG</span>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`chat-message ${msg.role}`}
              >
                <div className="chat-avatar" aria-hidden>
                  {msg.role === "assistant" ? <Icon name="bot" size={16} /> : <Icon name="user" size={16} />}
                </div>
                <div className="chat-bubble">{msg.content}</div>
              </motion.div>
            ))}
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="chat-message assistant"
              >
                <div className="chat-avatar" aria-hidden>
                  <Icon name="bot" size={16} />
                </div>
                <div className="chat-bubble" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
                  Thinking…
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEnd} />
        </div>

        <div className="chat-input-row">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something grounded in your uploads…"
            disabled={loading}
            aria-label="Message"
          />
          <button type="button" className="btn btn-primary" onClick={sendMessage} disabled={loading || !input.trim()} aria-label="Send">
            <Icon name="send" size={18} />
            Send
          </button>
        </div>
      </div>
    </AnimatedPage>
  );
}
