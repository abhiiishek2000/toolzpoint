# Launch handoff

## Required owner decisions

1. Confirm the public canonical domain and apex/www preference.
2. Confirm the public contact channel, hosting provider/log retention, applicable legal details and final policy wording.
3. Have each tool's content/examples reviewed by a human. Health formulas and categories need qualified review. Set individual `reviewed` flags only after that review.
4. Choose whether to connect analytics, ads and error monitoring. No provider is currently active. Document consent handling by target region and scrub technical logs before activation.

## Deployment procedure

1. Use the pinned lockfile and Node 22+ in the hosting build.
2. Configure the production origin and keep indexing disabled on previews.
3. Run the complete CI checks. Review current dependency advisories.
4. Deploy a preview to the chosen Vercel project, then verify routes, security headers, real mobile devices, keyboard use, and copy behavior under HTTPS.
5. Measure Lighthouse on representative pages and real Core Web Vitals after deployment. The specification's p75 LCP/INP/CLS and 99.9% reliability require real operational data; a local test cannot establish them.
6. Configure uptime monitoring for `/api/health`. Confirm operator alert routing.
7. Record the previous known-good deployment URL/ID in the release record before promoting a new deployment. Roll back through the hosting provider if error rate or vitals regress; verify health and a tool run after rollback.
8. After review and canonical checks, enable indexing on production, confirm the sitemap and robots output, and submit the sitemap in Search Console.

## Remaining launch gates

Production hosting, Search Console ownership, real-user vitals, monitoring provider, provider-enabled ad/consent performance, manual screen-reader verification, and legal/health review are not completed by the local build. No credentials or public service accounts were supplied.
