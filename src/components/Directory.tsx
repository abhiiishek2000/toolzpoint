"use client";
import { useState } from "react";
import Link from "next/link";
import { categories, searchTools, tools } from "@/lib/tool-registry";
import { useLocalList } from "@/lib/useLocalList";
import { Icon } from "./Icon";
import { ToolCard } from "./ToolCard";
import { writeList } from "@/lib/storage";
export function Directory({
  initialQuery = "",
  initialCategory = "All tools",
  initialView = "all",
}: {
  initialQuery?: string;
  initialCategory?: string;
  initialView?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [view, setView] = useState(initialView);
  const favorites = useLocalList("favorites");
  const recents = useLocalList("recents");
  const results = searchTools(query, category).filter((t) =>
    view === "favorites"
      ? favorites.includes(t.slug)
      : view === "recent"
        ? recents.includes(t.slug)
        : true,
  );
  return (
    <>
      <div className="directory-search">
        <Icon name="Search" size={22} />
        <input
          aria-label="Search tools"
          placeholder="Search for a tool, task, or keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="icon-button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            <Icon name="X" />
          </button>
        )}
      </div>
      <div className="filter-row" aria-label="Filter by category">
        {["All tools", ...categories.map((c) => c.name)].map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? "active" : ""}`}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="directory-toolbar">
        <p role="status">
          {results.length} {results.length === 1 ? "tool" : "tools"}
          {query ? ` for “${query}”` : ""}
        </p>
        <label className="view-select">
          <span className="sr-only">Show tools</span>
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="all">All tools</option>
            <option value="favorites">My favorites</option>
            <option value="recent">Recently used</option>
          </select>
        </label>
        {view === "recent" && recents.length > 0 && (
          <button
            className="text-button"
            onClick={() => writeList("recents", [])}
          >
            Clear history
          </button>
        )}
      </div>
      {results.length ? (
        <div className="tool-grid">
          {results.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name={view === "favorites" ? "Star" : "Search"} size={36} />
          <h2>
            {view === "favorites"
              ? "Your useful little collection starts here."
              : "No tools found."}
          </h2>
          <p>
            {view === "favorites"
              ? "Open a tool and select Save tool to keep it close."
              : "Try a different keyword or reset the filters."}
          </p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setCategory("All tools");
              setView("all");
            }}
          >
            Browse all tools
          </button>
        </div>
      )}
    </>
  );
}
export function RecentTools() {
  const slugs = useLocalList("recents");
  const recent = slugs
    .map((s) => tools.find((t) => t.slug === s))
    .filter((t) => t !== undefined)
    .slice(0, 3);
  if (!recent.length) return null;
  return (
    <section className="section recent-section">
      <div className="section-heading">
        <h2>Pick up where you left off</h2>
        <Link href="/tools?view=recent">
          View history <Icon name="ArrowRight" size={16} />
        </Link>
      </div>
      <div className="tool-grid">
        {recent.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </section>
  );
}
