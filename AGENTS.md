# ToolzPoint engineering contract

## Boundaries

- `src/app`: Next.js routes, server-rendered content, metadata and infrastructure routes.
- `src/features/tools`: pure domain calculations and validation. No React, network requests, local storage, or analytics.
- `src/features/files`: bounded image/PDF logic and browser workers. Parse image dimensions before bitmap allocation; keep timeout and cancellation.
- `src/features/qr-code-generator`: static QR generation and validation.
- `src/components`: accessible reusable UI, client state and shared tool workspace.
- `src/lib`: registry, metadata, local-storage helpers, analytics adapter.
- `tests`: independently specified domain assertions, registry consistency, browser workflows and accessibility checks.

Keep strict TypeScript and noUncheckedIndexedAccess enabled. Keep input validation and formulas out of React components. A published slug is stable. Use permanent redirects for any approved rename. Do not upload tool inputs, include input or output in telemetry, execute pasted code, expose secrets, or introduce accounts or a database without a product requirement. Preserve unrelated user changes.

## Commands and gates

Node 24.x. `npm ci`, `npm run dev`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`.

Every tool must have bounded inputs, independently checked examples, errors, copy/reset where meaningful, visible labels, privacy and limitation text, three FAQs, related links, and tests. All quality checks must pass before reporting implementation complete. Report environmental failures exactly. Do not suppress type or lint errors without documenting the reason.

## Publication

Indexing is disabled by default. Human review is required to set a tool's reviewed flag. Production deployment requires confirmed canonical origin, final operator/contact details, reviewed health formulas and policy copy, and a monitored rollback plan. Do not activate analytics, ads, or error providers without approved configuration and actual data-flow documentation.
