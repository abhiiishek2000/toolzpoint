import { Directory } from "@/components/Directory";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "All tools",
    "Free browser tools for images, PDFs, calculators, finance, health, documents, converters, and more. No sign-up, and your input never leaves your device.",
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
