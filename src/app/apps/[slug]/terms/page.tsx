import { notFound } from "next/navigation";
import Link from "next/link";
import { metadata, notFoundMetadata } from "@/lib/seo";
const lastUpdated = "December 02, 2025";
const docs: Record<string, { appName: string; supportEmail: string }> = {
  cashyai: { appName: "CashyAI", supportEmail: "support@cashyai.com" },
};
export function generateStaticParams() {
  return Object.keys(docs).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = docs[slug];
  return d
    ? metadata(
        `${d.appName} Terms & Conditions`,
        `Terms and Conditions for ${d.appName}, last updated ${lastUpdated}.`,
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
  const d = docs[slug];
  if (!d) notFound();
  return (
    <main id="main" className="page-container prose-page">
      <div className="eyebrow">{d.appName.toUpperCase()} / TERMS</div>
      <h1>Terms and Conditions</h1>
      <p className="page-lead">Last updated: {lastUpdated}</p>
      <p>Please read these terms carefully before using {d.appName}.</p>
      <section>
        <h2>Acknowledgment</h2>
        <p>
          These Terms and Conditions govern your use of {d.appName} and form the
          agreement between you and the Company. By accessing or using the
          Service you agree to be bound by these Terms. If you disagree with any
          part, you may not access the Service.
        </p>
        <p>
          You represent that you are over the age of 18. The Company does not
          permit those under 18 to use the Service. Your use is also conditioned
          on your acceptance of the{" "}
          <Link href={`/apps/${slug}/privacy`}>Privacy Policy</Link>.
        </p>
      </section>
      <section>
        <h2>Links to other websites</h2>
        <p>
          Our Service may contain links to third-party websites or services not
          owned or controlled by the Company. The Company has no control over,
          and assumes no responsibility for, the content or privacy practices of
          any third-party sites or services.
        </p>
      </section>
      <section>
        <h2>Termination</h2>
        <p>
          We may terminate or suspend your access immediately, without prior
          notice, for any reason, including if you breach these Terms. Upon
          termination, your right to use the Service ceases immediately.
        </p>
      </section>
      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, the entire liability of the
          Company and its suppliers, and your exclusive remedy, is limited to
          the amount you actually paid through the Service, or 100 USD if you
          have not purchased anything through the Service. Some jurisdictions do
          not allow these exclusions, in which case liability is limited to the
          greatest extent permitted by law.
        </p>
      </section>
      <section>
        <h2>&ldquo;As is&rdquo; and &ldquo;as available&rdquo; disclaimer</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;, with all faults, and without warranty of any kind,
          to the maximum extent permitted by law. The Company does not warrant
          that the Service will meet your requirements, be uninterrupted,
          timely, secure, or error-free.
        </p>
      </section>
      <section>
        <h2>Governing law</h2>
        <p>
          The laws of India, excluding its conflict-of-law rules, govern these
          Terms and your use of the Service.
        </p>
      </section>
      <section>
        <h2>Disputes resolution</h2>
        <p>
          If you have any concern or dispute about the Service, you agree to
          first try to resolve it informally by contacting the Company.
        </p>
      </section>
      <section>
        <h2>Severability and waiver</h2>
        <p>
          If any provision of these Terms is held unenforceable, that provision
          will be changed and interpreted to accomplish its objectives to the
          greatest extent possible, and the remaining provisions continue in
          full force. Failure to exercise a right under these Terms does not
          waive that right.
        </p>
      </section>
      <section>
        <h2>Changes to these terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. If
          a revision is material, we will make reasonable efforts to provide at
          least 30 days&apos; notice before new terms take effect.
        </p>
      </section>
      <section>
        <h2>Contact us</h2>
        <p>
          If you have any questions about these Terms, contact us by email:{" "}
          <a href={`mailto:${d.supportEmail}`}>{d.supportEmail}</a>.
        </p>
      </section>
      <p className="updated">
        Back to <Link href={`/apps/${slug}`}>{d.appName}</Link>
      </p>
    </main>
  );
}
