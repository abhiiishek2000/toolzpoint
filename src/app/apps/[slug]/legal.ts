import type { ReactNode } from "react";
/** Contact details shared by an app's privacy policy and terms pages. */
export type LegalDoc = {
  appName: string;
  supportEmail: string;
  lastUpdated: string;
};
export type LegalBodyProps = { doc: LegalDoc; slug: string };
export type LegalPage = LegalDoc & {
  Body: (props: LegalBodyProps) => ReactNode;
};
export const cashyAiDoc: LegalDoc = {
  appName: "CashyAI",
  supportEmail: "support@cashyai.com",
  lastUpdated: "December 02, 2025",
};
export const wendDoc: LegalDoc = {
  appName: "Wend",
  supportEmail: "ak663904@gmail.com",
  lastUpdated: "September 25, 2026",
};
