# ToolzPoint

Seventeen private, browser-based utilities built with Next.js 16 App Router, React, strict TypeScript, Zod, and Tailwind CSS. Server-rendered tool content includes examples, limitations, FAQs, metadata, and related tools.

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

Image Compressor, Image Resizer, Merge PDF, Images to PDF, QR Code Generator, Word Counter, JSON Formatter, Percentage Calculator, Age Calculator, Base64 Encoder / Decoder, URL Encoder / Decoder, UUID Generator, Slug Generator, UTM Link Builder, SIP Calculator, Nutrition Calculator, and BMI Calculator.

Search, eight categories, device-local favorites and recent history, themes, consent settings, health endpoint, trust pages, sitemap, robots, manifest, and Open Graph image are included.

## Deployment and review

The app is deployed at https://toolzpoint.vercel.app. See `docs/VERCEL_DEPLOYMENT.md` for redeployment and verification. Indexing is off pending content review. Set `NEXT_PUBLIC_SITE_URL` to the confirmed origin before building a deployment. After human content review, mark reviewed tool entries in the catalog and enable `NEXT_PUBLIC_ALLOW_INDEXING=true` on production only. Unreviewed tools remain noindex and excluded from the sitemap.

No analytics, advertising, or monitoring provider is connected. The privacy, contact, terms, and cookie pages state this accurately. The owner must confirm a public contact channel, legal details, hosting log retention, consent requirements, ad policy, and monitoring before public launch. See `docs/LAUNCH.md`.
