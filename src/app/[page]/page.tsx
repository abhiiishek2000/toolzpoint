import { notFound } from "next/navigation";
import { metadata } from "@/lib/seo";
const pages: Record<
  string,
  { title: string; lead: string; sections: [string, string][] }
> = {
  about: {
    title: "Useful by nature.",
    lead: "ToolzPoint is a collection of small web tools for everyday tasks.",
    sections: [
      [
        "A clear task. A clear answer.",
        "Count words, format JSON, prepare a campaign link, or explore a calculation. Each tool focuses on one job and explains how its result is produced. Core tools are free and require no account.",
      ],
      [
        "Private by design",
        "All current tools process input in your browser. Favorites, recent tool identifiers, and preferences are stored locally on your device. Hosting services may still receive ordinary request information.",
      ],
      [
        "Built to be understood",
        "Formulas, worked examples, and limitations sit alongside the tools. Health and finance results are general estimates. ToolzPoint is maintained by Abhishek Kumar.",
      ],
    ],
  },
  contact: {
    title: "Help make the tools better.",
    lead: "Report a calculation issue or suggest a tool from the project repository.",
    sections: [
      [
        "Share a reproducible issue",
        "This local build has no public contact endpoint configured. For now, share feedback with the project owner through the repository or your existing conversation. Include the tool name, expected behavior, browser, and steps to reproduce.",
      ],
      [
        "Keep private information private",
        "Use a made-up example instead of personal, financial, health, or confidential information. Do not share passwords, tokens, or sensitive pasted text.",
      ],
    ],
  },
  privacy: {
    title: "Your work stays with you.",
    lead: "Privacy information for the current ToolzPoint build. Updated September 12, 2026.",
    sections: [
      [
        "Tool inputs and outputs",
        "All current tools process input in the browser. ToolzPoint does not upload the text, URLs, ages, health measurements, financial inputs, or outputs entered into these tools. Results remain in page memory until the page is closed or reloaded.",
      ],
      [
        "Local storage",
        "The browser stores tool identifiers for favorites and recently used tools, along with theme and consent choices. These values use the toolzpoint:v1: namespace. Clear recent history in the tool directory, remove favorites individually, or clear site data through browser settings.",
      ],
      [
        "Hosting and optional services",
        "A hosting provider can receive IP addresses, requested paths, browser information, and ordinary technical logs. No analytics, advertising, or error-reporting provider is connected in this build. Optional analytics consent is off by default and may be changed in the footer.",
      ],
      [
        "Operator and requests",
        "Abhishek Kumar maintains this project. The public contact channel, hosting provider, retention details, and jurisdiction must be finalized before production launch. Until then, use the existing project communication channel for privacy questions.",
      ],
    ],
  },
  terms: {
    title: "A few ground rules.",
    lead: "Terms for the current ToolzPoint build. Updated September 12, 2026.",
    sections: [
      [
        "Using the tools",
        "You may use the core utilities without an account. You are responsible for the data you choose to enter and for checking outputs before relying on them. Do not use the site to harm others, bypass security, or interfere with availability.",
      ],
      [
        "Accuracy and availability",
        "Tools are provided as available. Calculation models simplify real situations and text transformations have documented limits. We do not promise uninterrupted service or that results will suit every purpose. Nothing here limits rights that cannot lawfully be excluded.",
      ],
      [
        "Health and finance",
        "Health tools provide general adult estimates, not diagnosis, treatment, or a meal plan. Investment outputs are mathematical illustrations, not financial advice or guaranteed returns. Consult an appropriately qualified professional when a decision requires individual advice.",
      ],
      [
        "Launch review",
        "These terms describe the current implementation. The operator must confirm applicable jurisdiction, contact details, and final legal wording before public launch.",
      ],
    ],
  },
  cookies: {
    title: "Only what you choose.",
    lead: "Storage and optional services are kept simple.",
    sections: [
      [
        "Essential preferences",
        "ToolzPoint uses browser localStorage, rather than application cookies, for theme choice, favorite tool identifiers, recent tool identifiers, and consent. The keys begin with toolzpoint:v1:. Values stay until you remove them or clear site data.",
      ],
      [
        "Optional analytics",
        "No analytics provider is connected. Consent defaults to off. The footer’s Cookie preferences control lets you allow or reject optional analytics; this preference alone does not load a provider.",
      ],
      [
        "Advertising",
        "No ad provider or advertising cookies are connected. Reserved ad components remain inactive. Provider details, regional consent behavior, and placement must be reviewed before activation.",
      ],
    ],
  },
  disclaimer: {
    title: "Useful context matters.",
    lead: "Understand what these tools can and cannot tell you.",
    sections: [
      [
        "General information",
        "Results are based on the inputs and mathematical or transformation rules shown on each tool page. Review those rules and limitations. We cannot know your full circumstances.",
      ],
      [
        "Health estimates",
        "Nutrition estimates are for adults aged 18 or older. CDC BMI categories are for adults aged 20 or older. These tools do not assess pregnancy, breastfeeding, childhood growth, illness, eating disorders, or individual health. Consult a qualified healthcare professional for health decisions.",
      ],
      [
        "Financial illustrations",
        "SIP projections assume a constant return and exclude tax, fees, inflation, and volatility. They are not predictions, guarantees, or recommendations to buy an investment.",
      ],
    ],
  },
  changelog: {
    title: "A growing little toolkit.",
    lead: "New tools and meaningful changes, in one place.",
    sections: [
      [
        "September 12, 2026 — Initial local release",
        "The original twelve browser tools: Word Counter, JSON Formatter, Percentage Calculator, Age Calculator, Base64 Encoder / Decoder, URL Encoder / Decoder, UUID Generator, Slug Generator, UTM Link Builder, SIP Calculator, Nutrition Calculator, and BMI Calculator.",
      ],
      [
        "A foundation for everyday use",
        "Search and category browsing, local favorites and recents, light and dark themes, copy controls, clear input validation, original explanations, and worked examples. This build is not indexed while source content and production settings await review.",
      ],
    ],
  },
};
export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const p = pages[page];
  return p ? metadata(p.title, p.lead, `/${page}`) : {};
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const p = pages[page];
  if (!p) notFound();
  return (
    <main id="main" className="page-container prose-page">
      <div className="eyebrow">TOOLZPOINT / {page.toUpperCase()}</div>
      <h1>{p.title}</h1>
      <p className="page-lead">{p.lead}</p>
      {p.sections.map(([heading, text]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>{text}</p>
        </section>
      ))}
    </main>
  );
}
