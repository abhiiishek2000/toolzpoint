import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apps, getApp } from "@/lib/app-registry";
import { metadata, notFoundMetadata, safeJson, siteUrl } from "@/lib/seo";
import { Icon } from "@/components/Icon";
export function generateStaticParams() {
  return apps.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getApp(slug);
  return a
    ? metadata(a.name, a.shortDescription, `/apps/${slug}`, a.reviewed)
    : notFoundMetadata;
}
export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getApp(slug);
  if (!a) notFound();
  return (
    <main id="main" className="page-container tool-page app-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/apps">All apps</Link>
        <Icon name="ChevronRight" size={14} />
        <span>{a.name}</span>
      </nav>
      <div className="tool-title app-hero">
        <span className="tool-icon app-icon app-icon-large">
          <Image src={a.icon} alt="" width={72} height={72} />
        </span>
        <div>
          <h1>{a.name}</h1>
          <p>{a.tagline}</p>
          <div className="app-hero-meta">
            <span>{a.platforms.join(" · ")}</span>
            <span>By {a.developer}</span>
          </div>
        </div>
      </div>
      <div className="app-cta">
        <a
          className="play-store-badge"
          href={a.playStoreUrl}
          rel="noopener noreferrer"
        >
          <Icon name="ArrowUpRight" size={16} />
          Get it on Google Play
        </a>
        <Link href={a.privacyPolicyPath}>
          Privacy Policy <Icon name="ArrowUpRight" size={15} />
        </Link>
        <Link href={a.termsPath}>
          Terms &amp; Conditions <Icon name="ArrowUpRight" size={15} />
        </Link>
      </div>
      <div className="tool-content app-content">
        <article>
          <section>
            <div className="eyebrow">ABOUT</div>
            <h2>What {a.name} does</h2>
            <p>{a.description}</p>
          </section>
          <section>
            <h2>Features</h2>
            <ul className="app-feature-list">
              {a.features.map((f) => (
                <li key={f}>
                  <Icon name="Check" size={16} />
                  {f}
                </li>
              ))}
            </ul>
          </section>
          {a.screenshots.length > 0 && (
            <section>
              <h2>Screenshots</h2>
              <div
                className="app-screenshots"
                role="region"
                aria-label={`${a.name} screenshots`}
                tabIndex={0}
              >
                {a.screenshots.map((s) => (
                  <Image
                    key={s.src}
                    src={s.src}
                    alt={s.alt}
                    width={270}
                    height={480}
                  />
                ))}
              </div>
            </section>
          )}
          <section>
            <h2>Google Sign-In &amp; your data</h2>
            <p>{a.googleSignIn.purpose}</p>
            <div className="scope-list">
              {a.googleSignIn.scopes.map((s) => (
                <div className="scope-item" key={s.scope}>
                  <code>{s.scope}</code>
                  <p>{s.reason}</p>
                </div>
              ))}
            </div>
            <p>{a.googleSignIn.dataNotAccessed}</p>
            <p>
              Full details are in the{" "}
              <Link href={a.privacyPolicyPath}>Privacy Policy</Link>.
            </p>
          </section>
          <section>
            <h2>Support</h2>
            <p>
              Questions, bugs, or feedback: email{" "}
              <a href={`mailto:${a.supportEmail}`}>{a.supportEmail}</a>.
            </p>
          </section>
          <p className="updated">Updated {a.updatedAt}</p>
        </article>
        <aside className="tool-sidebar">
          <Icon name="ShieldCheck" size={29} />
          <h3>Financial data stays on your device.</h3>
          <p>
            CashyAi&apos;s AI features run entirely on-device. Google Sign-In is
            optional and used only for Drive backup.
          </p>
          <Link href={a.privacyPolicyPath}>
            Read our privacy policy <Icon name="ArrowUpRight" size={15} />
          </Link>
          <hr />
          <h3>Package</h3>
          <p>
            <code>{a.packageId}</code>
          </p>
        </aside>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: a.name,
            description: a.shortDescription,
            url: new URL(`/apps/${slug}`, siteUrl).href,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Android",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </main>
  );
}
