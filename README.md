# ToolzPoint

Forty-one private, browser-based utilities built with Next.js 16 App Router, React, strict TypeScript, Zod, and Tailwind CSS. Server-rendered tool content includes examples, limitations, FAQs, metadata, and related tools.

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

Image Compressor, Image Resizer, Merge PDF, Split PDF, Images to PDF, Passport & ID Photo Maker, QR Code Generator, Word Counter, Case Converter, JSON Formatter, Hash Generator, JWT Decoder, Percentage Calculator, Discount Calculator, Date Difference Calculator, Age Calculator, Base64 Encoder / Decoder, URL Encoder / Decoder, UUID Generator, Slug Generator, UTM Link Builder, Meta Tag Generator, Invoice Maker, Biodata Maker, SIP Calculator, EMI / Loan Calculator, Compound Interest Calculator, GST Calculator, Savings Goal Calculator, Nutrition Calculator, BMI Calculator, Ideal Weight Calculator, Pregnancy Due Date Calculator, Ovulation Calculator, Water Intake Calculator, Body Fat Percentage Calculator, Waist-to-Hip Ratio Calculator, Heart Rate Zone Calculator, Temperature Converter, Password Generator, and Coin Flip.

Search, twelve categories, device-local favorites and recent history, themes, consent settings, health endpoint, trust pages, sitemap, robots, manifest, and Open Graph image are included.

## Deployment and review

The app is live at https://www.toolzpointt.com/. See `docs/VERCEL_DEPLOYMENT.md` for redeployment and verification. All tools are marked `reviewed: true` and indexing is enabled (`NEXT_PUBLIC_ALLOW_INDEXING=true`) as of 2026-09-19. In the Vercel project's **Production** environment variables only, set `NEXT_PUBLIC_SITE_URL=https://www.toolzpointt.com` and `NEXT_PUBLIC_ALLOW_INDEXING=true` — keep both unset/`false` on preview deployments so previews stay on their own preview URL and never get indexed. A tool added later starts with `reviewed: false`; flip it to `true` once its content has been checked, since the sitemap and each tool page's robots meta tag both key off that flag.

No analytics, advertising, or monitoring provider is connected. The privacy, contact, terms, and cookie pages state this accurately. The owner must confirm a public contact channel, legal details, hosting log retention, consent requirements, ad policy, and monitoring before public launch. See `docs/LAUNCH.md`.
