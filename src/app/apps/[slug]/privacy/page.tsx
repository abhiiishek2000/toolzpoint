import { notFound } from "next/navigation";
import Link from "next/link";
import { metadata, notFoundMetadata } from "@/lib/seo";
import { cashyAiDoc, wendDoc, type LegalPage } from "../legal";
import { CashyAiPrivacy } from "./cashyai";
import { WendPrivacy } from "./wend";
const pages: Record<string, LegalPage> = {
  cashyai: { ...cashyAiDoc, Body: CashyAiPrivacy },
  wend: { ...wendDoc, Body: WendPrivacy },
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
        `${d.appName} Privacy Policy`,
        `Privacy Policy for ${d.appName}, last updated ${d.lastUpdated}.`,
        `/apps/${slug}/privacy`,
      )
    : notFoundMetadata;
}
export default async function AppPrivacyPage({
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
      <div className="eyebrow">{d.appName.toUpperCase()} / PRIVACY POLICY</div>
      <h1>Privacy Policy</h1>
      <p className="page-lead">Last updated: {d.lastUpdated}</p>
      <Body doc={doc} slug={slug} />
      <p className="updated">
        Back to <Link href={`/apps/${slug}`}>{d.appName}</Link>
      </p>
    </main>
  );
}
