import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Check the CSS actually linked by each generated tool page, not just source CSS
// or an unreferenced asset. Fail deployment if a cached stylesheet loses reports.
const buildDirectory = path.resolve(".next");
const pagesDirectory = path.join(buildDirectory, "server/app/tools");
const requiredSelectors = [
  ".tool-quick-nav",
  ".enhanced-workspace",
  ".schedule-panel",
  ".schedule-controls",
  ".detail-section",
  ".detail-table",
  ".data-table-scroll",
  ".growth-chart",
  ".chart-balance",
  ".chart-principal",
  ".insight-report",
  ".insight-table",
  ".search-preview",
  ".text-comparison",
  ".document-studio-preview",
];
const pageFiles = (await readdir(pagesDirectory, { recursive: true })).filter(
  (file) => file.endsWith(".html"),
);
if (pageFiles.length === 0) {
  throw new Error(
    "No generated tool pages found for result stylesheet checks.",
  );
}

const stylesheets = new Map();
for (const file of pageFiles) {
  const html = await readFile(path.join(pagesDirectory, file), "utf8");
  const links = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => {
      if (!/\brel="stylesheet"/.test(tag)) return undefined;
      return tag.match(/\bhref="([^"]+)"/)?.[1];
    })
    .filter(Boolean);
  const css = (
    await Promise.all(
      links.map(async (href) => {
        const pathname = new URL(href, "https://build.invalid").pathname;
        if (!pathname.startsWith("/_next/static/")) return "";
        if (!stylesheets.has(pathname)) {
          stylesheets.set(
            pathname,
            readFile(path.join(buildDirectory, pathname.slice(7)), "utf8"),
          );
        }
        return stylesheets.get(pathname);
      }),
    )
  ).join("\n");
  const missing = requiredSelectors.filter(
    (selector) => !css.includes(selector),
  );
  if (missing.length > 0) {
    throw new Error(`Missing result styles on ${file}: ${missing.join(", ")}`);
  }
}
console.log(`Verified result styles linked by ${pageFiles.length} tool pages.`);
