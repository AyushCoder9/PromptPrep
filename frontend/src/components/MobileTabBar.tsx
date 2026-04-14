import { NavLink } from "react-router-dom";
import Icon from "./Icon";

const TABS = [
  { to: "/dashboard", icon: "home" as const, label: "Home", end: true },
  { to: "/upload", icon: "upload" as const, label: "Upload", end: false },
  { to: "/quiz", icon: "quiz" as const, label: "Quiz", end: false },
  { to: "/flashcards", icon: "flashcards" as const, label: "Cards", end: false },
  { to: "/chat", icon: "chat" as const, label: "Chat", end: false },
  { to: "/demo", icon: "demo" as const, label: "Demo", end: false },
];

export default function MobileTabBar() {
  return (
    <nav className="mobile-tab-bar" aria-label="Quick navigation">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `mobile-tab ${isActive ? "mobile-tab--active" : ""}`}>
          <Icon name={t.icon} size={20} className="mobile-tab__icon" />
          <span className="mobile-tab__label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
