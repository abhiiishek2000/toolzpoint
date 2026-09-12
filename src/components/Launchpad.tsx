"use client";
import { useState } from "react";
import Link from "next/link";
import { tools, searchTools } from "@/lib/tool-registry";
import { Icon } from "./Icon";
import { ToolCard } from "./ToolCard";
const tabs = [
  [
    "For creators",
    [
      "image-compressor",
      "image-resizer",
      "merge-pdf",
      "images-to-pdf",
      "qr-code-generator",
      "word-counter",
    ],
  ],
  [
    "Work & study",
    [
      "merge-pdf",
      "images-to-pdf",
      "word-counter",
      "percentage-calculator",
      "age-calculator",
      "sip-calculator",
    ],
  ],
  [
    "Build & publish",
    [
      "json-formatter",
      "qr-code-generator",
      "utm-builder",
      "slug-generator",
      "url-encoder-decoder",
      "uuid-generator",
    ],
  ],
] as const;
export function Launchpad() {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const active = tabs[tab] ?? tabs[0];
  const selected = query
    ? searchTools(query)
    : active[1]
        .map((s) => tools.find((t) => t.slug === s))
        .filter((t) => t !== undefined);
  return (
    <section className="launchpad" id="browse-tools">
      <div className="studio-section-heading">
        <div>
          <div className="mini-kicker">A SHORTCUT FOR EVERY KIND OF DAY</div>
          <h2>What are we making happen?</h2>
        </div>
        <Link href="/tools">
          All {tools.length} tools
          <Icon name="ArrowUpRight" size={16} />
        </Link>
      </div>
      <div className="launchpad-toolbar">
        <div className="task-tabs" aria-label="Choose tools by task">
          {tabs.map(([name], i) => (
            <button
              key={name}
              aria-pressed={tab === i}
              className={tab === i ? "active" : ""}
              onClick={() => {
                setTab(i);
                setQuery("");
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <label className="inline-tool-search">
          <Icon name="Search" size={17} />
          <span className="sr-only">Find a tool</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find your next shortcut…"
          />
        </label>
      </div>
      <div className="tool-grid">
        {selected.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
      {!selected.length && (
        <div className="empty-state">
          <h3>No matches yet.</h3>
          <p>Try “photo”, “PDF”, or “calculator”.</p>
          <button className="text-button" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}
