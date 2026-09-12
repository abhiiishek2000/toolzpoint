# Verification record

Verified September 12, 2026, using Node 24.19.0 on macOS.

- `npm ci`: passed; exact lockfile install. npm audit reported zero vulnerabilities. ESLint 9 emits a deprecation notice; a future upgrade must retain Next.js plugin compatibility.
- `npm run format:check`: passed.
- `npm run lint`: passed with no errors or warnings.
- `npm run typecheck`: passed.
- `npm test`: 29 passed across domain, file, QR, registry and privacy tests.
- `npm run build`: passed; all seventeen tool routes and eight category routes are prerendered. Search and the directory's preference query are server-rendered on request.
- `npm run test:e2e`: 44 passed across desktop Chromium and a mobile Chromium viewport. The local run used `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to select installed Chromium; CI installs the package-matched browser.
- Automated axe scans: no serious or critical violations on the homepage and JSON workspace in desktop/mobile tests.
- Initial modern-browser JavaScript on the representative Word Counter route: below 170 KiB gzip. The test excludes legacy `nomodule` scripts; tool algorithms and Zod load on the first Run action. It does not assert total post-interaction bytes are under this initial-load budget.
- Visual inspection: desktop homepage and populated JSON workspace; 360-pixel mobile homepage and dark theme. Reflow checks also pass at 320 pixels.
- Privacy checks: consent defaults off, raw/unknown telemetry properties are discarded, blocked/corrupt local storage does not break core tools.

## Corrected during validation

The initial sandboxed Turbopack build failed because a build subprocess could not bind a port. The build passed with required process permissions. Browser test package types were aligned. The mobile Favorites icon received an accessible name. Test selectors were scoped to the workspace to distinguish tool messages from Next.js route announcements. Validation code was deferred to satisfy the initial JavaScript budget.

## Limits of this evidence

These are local tests, not a production certification. Real-user Core Web Vitals, uptime, Lighthouse CI, comprehensive test coverage reporting, provider-enabled ad performance, manual screen-reader review, health-content review, legal review, public contact configuration, and deployment remain launch tasks. JSON errors provide line/column context rather than semantic object paths. No production monitoring or third-party providers are configured.

## Creator revision evidence

The revised homepage and five new tools passed desktop/mobile workflows with actual JPG, PNG, WebP, PDF, and QR outputs. File downloads, PDF ordering, image header limits, QR validation, homepage instant QR, and task filtering are covered. The final browser suite passed 44 tests and the unit suite passed 29. Homepage and file-workspace axe scans have no serious or critical violations in tested states. Build, lint, typecheck, formatting, and the representative initial JavaScript budget pass. The dependency install reported zero known vulnerabilities.

Desktop and mobile layouts were visually reviewed. Two low-contrast featured-card captions were corrected before the final test run. Keyword volumes and organic traffic have not been measured; no traffic-growth guarantee is implied by the new tool mix.
