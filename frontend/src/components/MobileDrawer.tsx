import { Link, NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
import Icon from "./Icon";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "drawer-backdrop--visible" : ""}`}
        onClick={onClose}
        role="presentation"
        aria-hidden={!open}
      />
      <div className={`drawer-panel ${open ? "drawer-panel--open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigation">
        <div className="drawer-panel__head">
          <Link to="/" className="drawer-panel__brand" onClick={onClose}>
            <div className="drawer-panel__mark" aria-hidden>
              <Icon name="logo" size={18} />
            </div>
            <span className="drawer-panel__title">PromptPrep</span>
          </Link>
          <button type="button" className="drawer-panel__close" onClick={onClose} aria-label="Close menu">
            <Icon name="close" size={22} />
          </button>
        </div>
        <nav className="drawer-panel__nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `drawer-nav-link ${isActive ? "drawer-nav-link--active" : ""}`}
              end={item.to === "/dashboard"}
              onClick={onClose}
            >
              <span className="drawer-nav-link__icon">
                <Icon name={item.icon} size={20} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="drawer-panel__note">Quizzes, flashcards, and chat use your uploaded library.</p>
      </div>
    </>
  );
}
