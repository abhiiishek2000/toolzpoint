import { notFound } from "next/navigation";
import Link from "next/link";
import { metadata, notFoundMetadata } from "@/lib/seo";
import { cashyAiDoc, wendDoc, type LegalPage } from "../legal";
import { CashyAiTerms } from "./cashyai";
import { WendTerms } from "./wend";
const pages: Record<string, LegalPage> = {
  cashyai: { ...cashyAiDoc, Body: CashyAiTerms },
  wend: { ...wendDoc, Body: WendTerms },
};
export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = pages[slug];
  return d
    ? metadata(
        `${d.appName} Terms & Conditions`,
        `Terms and Conditions for ${d.appName}, last updated ${d.lastUpdated}.`,
        `/apps/${slug}/terms`,
      )
    : notFoundMetadata;
}
export default async function AppTermsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = pages[slug];
  if (!d) notFound();
  const { Body, ...doc } = d;
  return (
    <main id="main" className="page-container prose-page">
      <div className="eyebrow">{d.appName.toUpperCase()} / TERMS</div>
      <h1>Terms and Conditions</h1>
      <p className="page-lead">Last updated: {d.lastUpdated}</p>
      <Body doc={doc} slug={slug} />
      <p className="updated">
        Back to <Link href={`/apps/${slug}`}>{d.appName}</Link>
      </p>
    </main>
  );
}
