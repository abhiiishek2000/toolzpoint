import Link from "next/link";
import { Icon } from "@/components/Icon";
import { StudioNav } from "@/components/StudioNav";
import { Launchpad } from "@/components/Launchpad";
import { RecentTools } from "@/components/Directory";
import QrCreator from "@/components/QrCreator";
import { metadata, safeJson, siteUrl } from "@/lib/seo";
import { createQr } from "@/features/qr-code-generator/domain";
export const generateMetadata = () =>
  metadata(
    "Free image, PDF, calculator & everyday tools",
    "Compress images, merge PDFs, make a passport photo, calculate EMI or GST, check BMI, and more. Free browser tools, no sign-up, nothing uploaded.",
    "/",
  );
export default async function Home() {
  const qr = await createQr("https://example.com");
  return (
    <main id="main" className="studio-home">
      <StudioNav />
      <div className="studio-main">
        <section className="studio-hero">
          <div className="studio-hero-copy">
            <div className="mini-kicker">
              <span className="pill-new">THE EVERYDAY CREATIVE TOOLKIT</span>
            </div>
            <h1>
              Big ideas.
              <br />
              <span>Small busywork.</span>
            </h1>
            <p>
              Compress it. Convert it. Create it.
              <br />
              Useful little tools that keep your day moving.
            </p>
            <div className="hero-button-row">
              <a className="button primary" href="#browse-tools">
                Find your next shortcut
                <Icon name="ArrowDown" size={17} />
              </a>
              <span>
                No sign-up.
                <br />
                <strong>No nonsense.</strong>
              </span>
            </div>
          </div>
          <div className="hero-quick-tool">
            <QrCreator compact initialImage={qr} />
          </div>
        </section>
        <div className="studio-proof">
          <span>
            <Icon name="CheckCircle2" size={16} />
            Free to use
          </span>
          <span>
            <Icon name="ShieldCheck" size={16} />
            Processed on your device
          </span>
          <span>
            <Icon name="Download" size={16} />
            Your output, ready to keep
          </span>
        </div>
        <section className="spotlights" aria-label="Featured creative tools">
          <Link
            href="/tools/image-compressor"
            className="spotlight spotlight-image"
          >
            <div className="spotlight-top">
              <span>LESS SIZE. MORE POSSIBILITIES.</span>
              <Icon name="ArrowUpRight" size={21} />
            </div>
            <div className="spotlight-symbol">
              <Icon name="ImageDown" size={42} />
              <span>JPG / PNG / WEBP</span>
            </div>
            <h2>
              Make room
              <br />
              for the good stuff.
            </h2>
            <p>Compress images. Keep the detail.</p>
            <span className="spotlight-action">
              Compress an image
              <Icon name="ArrowRight" size={17} />
            </span>
          </Link>
          <Link href="/tools/merge-pdf" className="spotlight spotlight-pdf">
            <div className="spotlight-top">
              <span>GET YOUR DOCS TOGETHER.</span>
              <Icon name="ArrowUpRight" size={21} />
            </div>
            <div className="spotlight-symbol">
              <Icon name="Files" size={42} />
              <span>PDF + PDF → DONE</span>
            </div>
            <h2>
              Many files.
              <br />
              One less problem.
            </h2>
            <p>Bring your PDFs into one document.</p>
            <span className="spotlight-action">
              Merge your PDFs
              <Icon name="ArrowRight" size={17} />
            </span>
          </Link>
          <Link
            href="/tools/image-resizer"
            className="spotlight spotlight-resize"
          >
            <div className="spotlight-top">
              <span>A BETTER FIT, EVERY TIME.</span>
              <Icon name="ArrowUpRight" size={21} />
            </div>
            <div className="spotlight-symbol">
              <Icon name="Crop" size={42} />
              <span>YOUR SIZE. YOUR FORMAT.</span>
            </div>
            <h2>
              Right size.
              <br />
              Ready to share.
            </h2>
            <p>Resize photos without stretching.</p>
            <span className="spotlight-action">
              Resize an image
              <Icon name="ArrowRight" size={17} />
            </span>
          </Link>
        </section>
        <Launchpad />
        <RecentTools />
        <section className="workflow-banner">
          <div>
            <div className="mini-kicker">FROM CAMERA ROLL TO READY TO SEND</div>
            <h2>
              A few photos.
              <br />
              One polished handoff.
            </h2>
            <p>
              Put receipts, scans, or creative references into a single PDF.
            </p>
            <Link className="button" href="/tools/images-to-pdf">
              Turn images into a PDF
              <Icon name="ArrowRight" size={17} />
            </Link>
          </div>
          <div className="workflow-steps">
            <span>
              <Icon name="Image" size={26} />
              Choose images
            </span>
            <Icon name="ArrowRight" size={20} />
            <span>
              <Icon name="ArrowUpDown" size={26} />
              Set the order
            </span>
            <Icon name="ArrowRight" size={20} />
            <span>
              <Icon name="FileText" size={26} />
              Download PDF
            </span>
          </div>
        </section>
        <div className="studio-bottom-note">
          <Icon name="LockKeyhole" size={17} />
          <p>Nothing to install. Nothing to upload. Just a little more done.</p>
          <Link href="/privacy">
            Our privacy promise
            <Icon name="ArrowUpRight" size={15} />
          </Link>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ToolzPoint",
            url: siteUrl,
            description:
              "A collection of free, private web tools for the things you do every day. No sign-up. Just useful.",
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ToolzPoint",
            url: siteUrl,
            logo: new URL("/icon.svg", siteUrl).href,
          }),
        }}
      />
    </main>
  );
}
