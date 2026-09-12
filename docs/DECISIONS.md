# Implementation decisions

- Built the requested 12-tool local MVP. Embedded phase-specific agent prompts in the source document were treated as reference text rather than overriding the user's request to build.
- Verified npm's supported stable Next.js version 16.3.5 and pinned it with React 19.3.0. Exact versions and the generated npm lockfile are committed as source artifacts. npm is used instead of the document's proposed pnpm.
- Reused a schema-driven client workspace for the twelve small utilities. Pure algorithms and schemas are separate from React. A client component is not embedded in the serializable server registry; the route mounts the workspace for the resolved slug. This prevents React component references from crossing the server-to-client props boundary.
- Content lives in structured JSON checked by a typed registry and consistency tests. No CMS, database, credentials, or file uploads are needed.
- The original health formula was checked at https://pubmed.ncbi.nlm.nih.gov/2305711/ on September 12, 2026. The simplified Mifflin–St Jeor equation is used. Activity factors are explicitly approximate assumptions. The macro split permits 10–35% protein, 20–35% fat and 45–65% carbohydrate; it does not prescribe a meal plan.
- CDC's adult BMI reference applies to age 20+, so the BMI tool rejects younger ages: https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html (checked September 12, 2026). Nutrition is age 18+. Human clinical/content review has not occurred and no reviewed flag is fabricated.
- JSON parsing uses the native browser parser. Error messages report approximate line and column; malformed input has no guaranteed semantic object path. Numeric precision follows JavaScript, and duplicate JSON object keys retain the last occurrence.
- February 29 birthdays fall on February 28 in non-leap years. End-of-month anniversaries clamp to the last day. Date math uses date-only UTC values; the default comparison date comes from the user's local calendar.
- SIP uses a nominal annual rate divided by twelve and an annuity formula, with beginning/end of month options. It does not promise market returns.
- No external analytics or ad provider is installed. The event adapter allows only enumerated properties, requires consent, and does nothing without a configured provider. Optional consent defaults off worldwide. Ad slots render nothing while inactive, leaving no blank space.
- CSP is report-only with inline scripts permitted for Next.js hydration; there is no unsafe-eval in the production policy. X-Frame-Options, nosniff, referrer and permissions policies are active. HSTS awaits a confirmed HTTPS deployment.

- The creator-focused revision adds five tools using qrcode 1.5.4 and pdf-lib 1.17.1. File transformations run in browser workers with documented limits and cancel/timeout behavior. See CREATOR_RELEASE.md.
