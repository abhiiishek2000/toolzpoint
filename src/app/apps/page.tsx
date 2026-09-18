import { apps } from "@/lib/app-registry";
import { metadata } from "@/lib/seo";
import { AppCard } from "@/components/AppCard";
export const generateMetadata = () =>
  metadata(
    "Apps",
    "Mobile apps built by ToolzPoint, including CashyAi, an Android expense tracker and AI money coach.",
    "/apps",
  );
export default function Apps() {
  return (
    <main id="main" className="page-container directory-page">
      <div className="eyebrow">BUILT BY TOOLZPOINT</div>
      <h1>Our apps.</h1>
      <p className="page-lead">
        Standalone mobile apps we build and maintain, alongside the browser
        tools on this site.
      </p>
      <div className="tool-grid app-grid">
        {apps.map((app) => (
          <AppCard app={app} key={app.slug} />
        ))}
      </div>
    </main>
  );
}
