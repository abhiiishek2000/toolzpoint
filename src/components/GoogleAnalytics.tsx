"use client";
import Script from "next/script";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { setAnalyticsAdapter } from "@/lib/analytics";
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
function readConsent() {
  try {
    return localStorage.getItem("toolzpoint:v1:consent") === "accepted";
  } catch {
    return false;
  }
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
  const consented = useSyncExternalStore(
    consentSubscribe,
    readConsent,
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
