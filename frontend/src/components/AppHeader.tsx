import { Link } from "react-router-dom";
import { breadcrumbForPath } from "../config/navigation";
import Icon from "./Icon";

type AppHeaderProps = {
  pathname: string;
  onOpenMenu: () => void;
};

export default function AppHeader({ pathname, onOpenMenu }: AppHeaderProps) {
  const crumbs = breadcrumbForPath(pathname);

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button type="button" className="app-header__menu-btn" onClick={onOpenMenu} aria-label="Open menu">
          <Icon name="menu" size={22} />
        </button>

        <nav className="app-breadcrumb" aria-label="Breadcrumb">
          <ol className="app-breadcrumb__list">
            {crumbs.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="app-breadcrumb__item">
                {i > 0 && (
                  <span className="app-breadcrumb__sep" aria-hidden>
                    <Icon name="chevronRight" size={14} />
                  </span>
                )}
                {crumb.to ? (
                  <Link to={crumb.to} className="app-breadcrumb__link">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="app-breadcrumb__current">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
