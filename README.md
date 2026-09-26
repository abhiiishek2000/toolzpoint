# ToolzPoint

112 private, browser-based utilities built with Next.js 16 App Router, React, strict TypeScript, Zod, and Tailwind CSS. Server-rendered tool content includes examples, limitations, FAQs, metadata, and related tools.

## Local development

Use Node.js 24 (validated on Node 24.19.0).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. No database, API key, or account is required.

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run start
npm run test:e2e
```

For a fresh test machine, run `npx playwright install --with-deps chromium` before the browser tests. The E2E suite starts the production server automatically when none is running.

## Included tools

Word Counter, JSON Formatter, Percentage Calculator, Age Calculator, Base64 Encoder / Decoder, URL Encoder / Decoder, UUID Generator, Slug Generator, UTM Link Builder, SIP Calculator, Nutrition Calculator, BMI Calculator, Image Compressor, Image Resizer, Merge PDF, Images to PDF, QR Code Generator, Password Generator, Coin Flip, EMI / Loan Calculator, Compound Interest Calculator, Temperature Converter, Discount Calculator, Ideal Weight Calculator, Case Converter, Hash Generator, JWT Decoder, Meta Tag Generator, Split PDF, Passport & ID Photo Maker, Date Difference Calculator, Pregnancy Due Date Calculator, Ovulation Calculator, GST Calculator, Water Intake Calculator, Body Fat Percentage Calculator, Waist-to-Hip Ratio Calculator, Heart Rate Zone Calculator, Savings Goal Calculator, Invoice Maker, Biodata Maker, Character Counter, Lorem Ipsum Generator, Duplicate Line Remover, Remove Line Breaks, Text Line Sorter, Find & Replace, Whitespace/Trim Tool, Text Reverser, NATO Phonetic Alphabet, ROT13 / Caesar Cipher, Text / Binary Converter, URL Parser, Unix Timestamp Converter, JSON to CSV Converter, Tip Calculator, Average & Median Calculator, Ratio Calculator, Simple Interest Calculator, ROI Calculator, Break-Even Calculator, BMR / Resting Energy Calculator, XML Sitemap Generator, Hashtag Formatter & Counter, Weight Converter, Length Converter, Speed Converter, Data Storage Converter, Number Base Converter, PIN Code Generator, Dice Roller, Random Number Generator, Random Name Picker, Payment Receipt Maker, Image Format Converter, Image Rotate & Flip, Rotate PDF, Add Page Numbers to PDF, Macro (Protein/Carb/Fat) Calculator, Sleep Cycle Calculator, Calories Burned Calculator, Reorder & Delete PDF Pages, PDF Page Count & Info Viewer, Watermark PDF, Mortgage Calculator, Fixed Deposit (FD) Calculator, Recurring Deposit (RD) Calculator, Inflation Calculator, Net Worth Calculator, GPA Calculator, Quadratic Equation Solver, Work Hours Calculator, Timezone Converter, Roman Numeral Converter, Open Graph Preview Generator, Social Post Character Counter, Password Strength Checker, Lottery Number Generator, Social Media Image Resizer, Resume Maker, Business Days Calculator, Countdown Timer, CAGR Calculator, Sales Tax Calculator, Volume Converter, Area Converter, Color Converter, Reading Time Calculator, Text Diff Checker, Dog Age Calculator, Magic 8 Ball, Love Calculator.

Search, twelve categories, device-local favorites and recent history, themes, consent settings, health endpoint, trust pages, sitemap, robots, manifest, and Open Graph image are included.

## Deployment and review

The app is live at https://www.toolzpointt.com/. See `docs/VERCEL_DEPLOYMENT.md` for redeployment and verification. All 112 tools are marked `reviewed: true` and indexing is enabled (`NEXT_PUBLIC_ALLOW_INDEXING=true`) as of 2026-09-19. In the Vercel project's **Production** environment variables only, set `NEXT_PUBLIC_SITE_URL=https://www.toolzpointt.com` and `NEXT_PUBLIC_ALLOW_INDEXING=true` — keep both unset/`false` on preview deployments so previews stay on their own preview URL and never get indexed. A tool added later starts with `reviewed: false`; flip it to `true` once its content has been checked, since the sitemap and each tool page's robots meta tag both key off that flag.

Google Analytics (GA4) is wired up and environment-gated: set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the Vercel **Production** environment only (leave it unset locally and on previews). Optional analytics defaults to on — it loads for a visitor unless they choose "Essential only" in the footer's Cookie preferences, which is stored and respected from then on. See `src/components/GoogleAnalytics.tsx` and `src/lib/analytics.ts`'s `isAnalyticsAllowed`. No advertising or error-reporting provider is connected. The privacy, contact, terms, and cookie pages state this accurately. The owner must confirm a public contact channel, legal details, hosting log retention, consent requirements, ad policy, and monitoring before public launch. See `docs/LAUNCH.md`.
