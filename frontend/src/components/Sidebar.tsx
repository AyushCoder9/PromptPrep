import { Link, NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
import Icon from "./Icon";

export default function Sidebar() {
  return (
    <aside className="sidebar sidebar--desktop" aria-label="Main navigation">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo-link">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark" aria-hidden>
              <Icon name="logo" size={18} />
            </div>
            <div>
              <span className="sidebar-logo-text">PromptPrep</span>
              <span className="sidebar-logo-kicker">Study from your documents</span>
            </div>
          </div>
        </Link>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {NAV_ITEMS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            end={link.to === "/dashboard"}
          >
            <span className="nav-link-icon">
              <Icon name={link.icon} size={18} />
            </span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-note">Upload notes, then generate quizzes, flashcards, and grounded Q&amp;A with RAG.</p>
      </div>
    </aside>
  );
}
