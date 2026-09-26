import { notFound } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/tool-registry";
import { Directory } from "@/components/Directory";
import { metadata, notFoundMetadata, safeJson, siteUrl } from "@/lib/seo";
const titleOverrides: Record<string, string> = {
  Images: "Image tools",
  Calculators: "Calculators",
  Finance: "Finance calculators",
  "Health & nutrition": "Health & nutrition calculators",
  Converters: "Unit converters",
};
function categoryTitle(name: string) {
  return (
    titleOverrides[name] ?? (/tools$/i.test(name) ? name : `${name} tools`)
  );
}
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
    ? metadata(categoryTitle(c.name), c.description, `/category/${slug}`)
    : notFoundMetadata;
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
      <h1>{categoryTitle(c.name)}.</h1>
      <p className="page-lead">{c.description}</p>
      <Directory initialCategory={c.name} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "All tools",
                item: new URL("/tools", siteUrl).href,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: categoryTitle(c.name),
                item: new URL(`/category/${slug}`, siteUrl).href,
              },
            ],
          }),
        }}
      />
    </main>
  );
}
