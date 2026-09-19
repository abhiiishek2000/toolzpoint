import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};
export default function NotFound() {
  return (
    <main id="main" className="page-container error-page">
      <div className="eyebrow">404 · A SMALL DETOUR</div>
      <h1>This tool isn’t here.</h1>
      <p>Try the directory to find what you need.</p>
      <Link className="button primary" href="/tools">
        Explore all tools
      </Link>
    </main>
  );
}
