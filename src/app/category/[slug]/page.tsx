import { notFound } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/tool-registry";
import { Directory } from "@/components/Directory";
import { metadata } from "@/lib/seo";
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categories.find((c) => c.slug === slug);
  return c
    ? metadata(`${c.name} tools`, c.description, `/category/${slug}`)
    : {};
}
export default async function Category({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categories.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <main id="main" className="page-container directory-page">
      <Link className="breadcrumb" href="/tools">
        All tools / {c.name}
      </Link>
      <h1>{c.name} tools.</h1>
      <p className="page-lead">{c.description}</p>
      <Directory initialCategory={c.name} />
    </main>
  );
}
