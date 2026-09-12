import Link from "next/link";
import { categories, tools } from "@/lib/tool-registry";
import { Icon } from "./Icon";
export function StudioNav() {
  return (
    <aside className="studio-nav">
      <div className="nav-section-label">YOUR WORKSPACE</div>
      <Link href="/" className="studio-nav-active">
        <Icon name="LayoutGrid" size={18} />
        Discover<span>{tools.length}</span>
      </Link>
      <Link href="/tools?view=favorites">
        <Icon name="Star" size={18} />
        Saved tools
      </Link>
      <Link href="/tools?view=recent">
        <Icon name="Clock3" size={18} />
        Recently used
      </Link>
      <div className="nav-section-label category-label">THE TOOLBOX</div>
      {categories.map((c) => (
        <Link key={c.slug} href={`/category/${c.slug}`}>
          <Icon name={c.icon} size={18} />
          {c.name}
          <span>{tools.filter((t) => t.category === c.name).length}</span>
        </Link>
      ))}
      <div className="nav-privacy">
        <span className="nav-privacy-icon">
          <Icon name="ShieldCheck" size={23} />
        </span>
        <strong>
          Your files.
          <br />
          Your business.
        </strong>
        <p>Local processing. Nothing to upload.</p>
        <Link href="/privacy">
          How we keep it private
          <Icon name="ArrowUpRight" size={14} />
        </Link>
      </div>
    </aside>
  );
}
