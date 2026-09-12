import { Directory } from "@/components/Directory";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Search tools",
    "Find a useful tool by name, category or task.",
    "/search",
    false,
  );
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <main id="main" className="page-container directory-page">
      <div className="eyebrow">FIND YOUR SHORTCUT</div>
      <h1>Search tools.</h1>
      <p className="page-lead">A useful answer is just a few letters away.</p>
      <Directory initialQuery={q ?? ""} />
    </main>
  );
}
