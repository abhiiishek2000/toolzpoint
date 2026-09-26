import Link from "next/link";
import { Icon } from "./Icon";
import { ThemeToggle } from "./Preferences";
export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="ToolzPoint home">
          <span className="brand-icon">
            <Icon name="Zap" size={22} />
          </span>
          toolzpoint<span className="brand-dot">.</span>
        </Link>
        <form action="/search" className="header-search">
          <Icon name="Search" size={17} />
          <input
            aria-label="Search all tools"
            name="q"
            placeholder="A tool for that? Probably."
          />
          <button type="submit" aria-label="Search tools">
            <Icon name="ArrowRight" size={17} />
          </button>
        </form>
        <div className="header-actions">
          <Link
            href="/search"
            className="icon-button mobile-search-link"
            aria-label="Search tools"
          >
            <Icon name="Search" size={19} />
          </Link>
          <Link href="/tools" className="all-tools-link">
            Explore tools
            <Icon name="ArrowUpRight" size={15} />
          </Link>
          <Link href="/apps" className="all-tools-link apps-link">
            Apps
            <Icon name="ArrowUpRight" size={15} />
          </Link>
          <Link
            href="/tools?view=favorites"
            className="saved-link"
            aria-label="Favorites"
          >
            <Icon name="Star" size={18} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
