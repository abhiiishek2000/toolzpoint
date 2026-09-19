"use client";
import Script from "next/script";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isAnalyticsAllowed, setAnalyticsAdapter } from "@/lib/analytics";
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
function consentSubscribe(notify: () => void) {
  window.addEventListener("toolzpoint:consent-changed", notify);
  return () => window.removeEventListener("toolzpoint:consent-changed", notify);
}
// Next's App Router doesn't reload the page on navigation, so gtag's
// automatic pageview (tied to a full page load) never fires again after the
// first one. Report each route change as its own page_view instead.
function Pageviews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!window.gtag) return;
    const query = searchParams.toString();
    window.gtag("event", "page_view", {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);
  return null;
}
export function GoogleAnalytics() {
  // The server can never see localStorage, so the snapshot used for the
  // very first paint must default to "not allowed" even though the real
  // policy is on-by-default — otherwise a visitor who explicitly rejected
  // analytics would still get Script's afterInteractive load kicked off
  // during the hydration pass that matches this snapshot, before the
  // corrective re-render (using the real, client-only check) has a chance
  // to stop it. Once mounted, next/script has already fired; there's no
  // taking it back. A visitor who is allowed just loads GA one render tick
  // later, which is imperceptible.
  const consented = useSyncExternalStore(
    consentSubscribe,
    isAnalyticsAllowed,
    () => false,
  );
  useEffect(() => {
    if (!consented || !GA_ID) return;
    setAnalyticsAdapter({
      track: (name, properties) => window.gtag?.("event", name, properties),
    });
    return () => setAnalyticsAdapter(undefined);
  }, [consented]);
  if (!GA_ID || !consented) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <Pageviews />
      </Suspense>
    </>
  );
}
