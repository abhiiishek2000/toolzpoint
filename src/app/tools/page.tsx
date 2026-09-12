import { Directory } from "@/components/Directory";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "All tools",
    "Explore twelve free browser tools for text, development, calculations, finance, health and campaign URLs.",
    "/tools",
  );
export default async function Tools({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return (
    <main id="main" className="page-container directory-page">
      <div className="eyebrow">YOUR EVERYDAY TOOLKIT</div>
      <h1>Find the right tool.</h1>
      <p className="page-lead">
        One small task. One useful tool. All free, all right here.
      </p>
      <Directory initialView={view} />
    </main>
  );
}
