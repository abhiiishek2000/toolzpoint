import Link from "next/link";
import Image from "next/image";
import type { AppDefinition } from "@/lib/app-registry";
import { Icon } from "./Icon";
export function AppCard({ app }: { app: AppDefinition }) {
  return (
    <Link className="tool-card app-card" href={`/apps/${app.slug}`}>
      <div className="card-top">
        <span className="tool-icon app-icon">
          <Image src={app.icon} alt="" width={48} height={48} />
        </span>
        <Icon name="ArrowUpRight" size={18} className="card-arrow" />
      </div>
      <h3>{app.name}</h3>
      <p>{app.shortDescription}</p>
      <div className="card-bottom">
        <span>{app.platforms.join(" · ")}</span>
        <span className="free-tag">Free</span>
      </div>
    </Link>
  );
}
