import { notFound } from "next/navigation";
import Link from "next/link";
import { tools, getTool, categoryFor } from "@/lib/tool-registry";
import { metadata, notFoundMetadata, safeJson, siteUrl } from "@/lib/seo";
import ToolRenderer from "@/components/ToolRenderer";
import { ToolCard } from "@/components/ToolCard";
import { Icon } from "@/components/Icon";
export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = getTool(slug);
  return t
    ? metadata(t.name, t.shortDescription, `/tools/${slug}`, t.reviewed)
    : notFoundMetadata;
}
function formatUpdated(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) notFound();
  const category = categoryFor(t.category);
  const toolUrl = new URL(`/tools/${slug}`, siteUrl).href;
  return (
    <main id="main" className="page-container tool-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/tools">All tools</Link>
        <Icon name="ChevronRight" size={14} />
        <Link href={`/category/${category?.slug}`}>{t.category}</Link>
        <Icon name="ChevronRight" size={14} />
        <span>{t.name}</span>
      </nav>
      <div className="tool-title">
        <span
          className={`tool-icon color-${t.category.split(" ")[0]?.toLowerCase()}`}
        >
          <Icon name={t.icon} size={29} />
        </span>
        <div>
          <h1>{t.name}</h1>
          <p>{t.shortDescription}</p>
        </div>
      </div>
      <ToolRenderer slug={slug} />
      {t.category === "Health & nutrition" && (
        <p className="health-note">
          General estimates only. This tool is not a diagnosis, treatment, or
          individual meal plan. Consult a qualified healthcare professional for
          health decisions.
        </p>
      )}
      <div className="tool-content">
        <article>
          <section>
            <div className="eyebrow">A LITTLE CONTEXT</div>
            <h2>About this {t.name.toLowerCase()}</h2>
            <p>{t.intro}</p>
          </section>
          <section>
            <h2>How it works</h2>
            <p>{t.how}</p>
          </section>
          <section>
            <h2>Try these examples</h2>
            <div className="examples">
              {t.examples.map((e, i) => (
                <div key={e.input}>
                  <span className="example-number">0{i + 1}</span>
                  <div>
                    <h3>{e.input}</h3>
                    <pre>{e.output}</pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2>Limitations & privacy</h2>
            <p>{t.limitations}</p>
            <p>
              Inputs and results stay in this browser. Only tool identifiers are
              stored for your recently used tools. You can clear that history
              from the directory.
            </p>
            {t.slug === "nutrition-calculator" && (
              <p>
                Formula reference:{" "}
                <a href="https://pubmed.ncbi.nlm.nih.gov/2305711/">
                  Mifflin et al., 1990
                </a>
                . Source checked September 12, 2026. Activity multipliers are
                illustrative assumptions, separate from the resting-energy
                equation.
              </p>
            )}
            {t.slug === "bmi-calculator" && (
              <p>
                Category reference:{" "}
                <a href="https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html">
                  CDC adult BMI categories
                </a>
                . Source checked September 12, 2026.
              </p>
            )}
          </section>
          <section>
            <h2>A few good questions</h2>
            {t.faq.map((f) => (
              <details key={f.question}>
                <summary>
                  {f.question}
                  <Icon name="ChevronRight" size={18} />
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </section>
          <p className="updated">Updated {formatUpdated(t.updatedAt)}</p>
        </article>
        <aside className="tool-sidebar">
          <Icon name="ShieldCheck" size={29} />
          <h3>Just you and your tools.</h3>
          <p>No account needed. No input uploads. Your work stays with you.</p>
          <Link href="/privacy">
            Read our privacy policy <Icon name="ArrowUpRight" size={15} />
          </Link>
          <hr />
          <h3>In this category</h3>
          {tools
            .filter((o) => o.category === t.category && o.slug !== slug)
            .map((o) => (
              <Link href={`/tools/${o.slug}`} key={o.slug}>
                {o.name}
                <Icon name="ArrowUpRight" size={15} />
              </Link>
            ))}
        </aside>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>Keep the momentum going.</h2>
          <Link href="/tools">
            All tools
            <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
        <div className="tool-grid related-grid">
          {t.relatedSlugs
            .map((s) => getTool(s))
            .filter((o) => o !== undefined)
            .map((o) => (
              <ToolCard tool={o} key={o.slug} />
            ))}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: t.name,
            description: t.shortDescription,
            url: toolUrl,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires JavaScript and a modern browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />
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
                name: t.category,
                item: new URL(`/category/${category?.slug}`, siteUrl).href,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: t.name,
                item: toolUrl,
              },
            ],
          }),
        }}
      />
    </main>
  );
}
