import Link from "next/link";
import type { ToolDefinition } from "@/lib/tool-registry";
import { Icon } from "./Icon";
export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link className="tool-card" href={`/tools/${tool.slug}`}>
      <div className="card-top">
        <span
          className={`tool-icon color-${tool.category.split(" ")[0]?.toLowerCase()}`}
        >
          <Icon name={tool.icon} size={24} />
        </span>
        <Icon name="ArrowUpRight" size={18} className="card-arrow" />
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.shortDescription}</p>
      <div className="card-bottom">
        <span>{tool.category}</span>
        <span className="free-tag">Free</span>
      </div>
    </Link>
  );
}
