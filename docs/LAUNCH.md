# Launch handoff

## Required owner decisions

1. Confirm the public canonical domain and apex/www preference.
2. Confirm the public contact channel, hosting provider/log retention, applicable legal details and final policy wording. The Contact page still states no public contact endpoint is configured — this needs a real address before launch.
3. All tools are currently marked `reviewed: true` on the owner's direct instruction (2026-09-19), so every tool page is indexable. Every formula shipped was independently verified against hand-computed examples and unit tests at build time, but that is not the same as the qualified, individual human review this checklist originally called for — health and finance categories in particular (BMI, nutrition, pregnancy, body fat, GST, EMI, and similar) carry real accuracy and liability exposure and are worth a second, qualified look before or shortly after launch. A tool added later starts `reviewed: false`; flip it only once its content has actually been checked.
4. Choose whether to connect analytics, ads and error monitoring. No provider is currently active. Document consent handling by target region and scrub technical logs before activation.

## Deployment procedure

1. Use the pinned lockfile and Node 24.x in the hosting build.
2. Configure the production origin and keep indexing disabled on previews.
3. Run the complete CI checks. Review current dependency advisories.
4. Deploy a preview to the chosen Vercel project, then verify routes, security headers, real mobile devices, keyboard use, and copy behavior under HTTPS.
5. Measure Lighthouse on representative pages and real Core Web Vitals after deployment. The specification's p75 LCP/INP/CLS and 99.9% reliability require real operational data; a local test cannot establish them.
6. Configure uptime monitoring for `/api/health`. Confirm operator alert routing.
7. Record the previous known-good deployment URL/ID in the release record before promoting a new deployment. Roll back through the hosting provider if error rate or vitals regress; verify health and a tool run after rollback.
8. After review and canonical checks, enable indexing on production, confirm the sitemap and robots output, and submit the sitemap in Search Console.

## Remaining launch gates

Production hosting, Search Console ownership, real-user vitals, monitoring provider, provider-enabled ad/consent performance, manual screen-reader verification, and legal/health review are not completed by the local build. No credentials or public service accounts were supplied.
