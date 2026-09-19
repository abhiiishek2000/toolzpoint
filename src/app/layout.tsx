import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Consent } from "@/components/Preferences";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Icon } from "@/components/Icon";
import { siteUrl, allowIndexing } from "@/lib/seo";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ToolzPoint — Your everyday creative toolkit.",
    template: "%s | ToolzPoint",
  },
  description:
    "A collection of free, private web tools for the things you do every day. No sign-up. Just useful.",
  robots: { index: allowIndexing, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <GoogleAnalytics />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <footer className="site-footer">
          <div className="footer-top">
            <div>
              <Link href="/" className="brand">
                <span className="brand-icon">
                  <Icon name="Zap" size={20} />
                </span>
                toolzpoint<span className="brand-dot">.</span>
              </Link>
              <p>Less busywork. More possibility.</p>
            </div>
            <div className="footer-links">
              <div>
                <strong>Explore</strong>
                <Link href="/tools">All tools</Link>
                <Link href="/#browse-tools">Categories</Link>
                <Link href="/apps">Apps</Link>
                <Link href="/changelog">What’s new</Link>
              </div>
              <div>
                <strong>ToolzPoint</strong>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/disclaimer">Disclaimer</Link>
              </div>
              <div>
                <strong>The essentials</strong>
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/cookies">Cookies</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 ToolzPoint. Made for everyday things.</span>
            <Consent />
            <span className="footer-private">
              <Icon name="ShieldCheck" size={15} />
              Private by design
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
