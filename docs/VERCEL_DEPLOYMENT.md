# Vercel deployment

## 2026-09-19 — Custom domain and indexing

The project's production traffic now lives at https://www.toolzpointt.com/. In the Vercel project's **Production** environment (not Preview or Development), set:

- `NEXT_PUBLIC_SITE_URL=https://www.toolzpointt.com`
- `NEXT_PUBLIC_ALLOW_INDEXING=true`

`siteUrl` (`src/lib/seo.ts`) prefers `NEXT_PUBLIC_SITE_URL` when set, so this is the one lever that controls the domain baked into canonical tags, the sitemap, Open Graph/Twitter URLs, and JSON-LD across the whole site — setting it explicitly is safer than relying on Vercel's automatic production-domain detection. `NEXT_PUBLIC_ALLOW_INDEXING` is separately what flips every page's robots meta tag from `noindex` to `index` (see README's "Deployment and review" section). Both are `NEXT_PUBLIC_*` variables, so **redeploy after changing either one** — they're inlined at build time, not read at request time. Leave both unset (or `false`) on Preview deployments so previews keep resolving to their own preview URL and never get indexed.

After redeploying, verify at the live domain: `view-source:` the homepage and a tool page and confirm `<link rel="canonical">` and `og:url` point at `https://www.toolzpointt.com/...`, then check `/sitemap.xml` and `/robots.txt` resolve under that same domain.

## Initial deployment record

Deployed September 12, 2026. The record below is a point-in-time snapshot from that first deployment (test counts, review status, and indexing state have all changed since — see the sections above and README for current status).

- Production: https://toolzpoint.vercel.app
- Vercel workspace: abhiiishek2000s-projects
- Project: toolzpoint
- Deployment ID: dpl_GH9AFnEpwwXXQigFJtLFRYw3bVCA
- Immutable deployment URL: https://toolzpoint-3sx3unhds-abhiiishek2000s-projects.vercel.app
- Dashboard: https://vercel.com/abhiiishek2000s-projects/toolzpoint

## Verified

Vercel remote build reached READY. The public homepage and health endpoint return HTTP 200. Canonical origin is https://toolzpoint.vercel.app. The nosniff header is present. Word Counter, image compression in a browser worker, and QR generation passed live HTTPS smoke tests with no page errors. Local build, formatting, lint, and 29 unit tests passed before deployment; the existing 44 browser regressions passed on the application release.

## Configuration

Node 24.x, Next.js framework preset, npm ci, npm run build. .vercel/project.json links this local folder to the project and is gitignored. Canonicals prefer NEXT_PUBLIC_SITE_URL when explicitly configured, otherwise Vercel's production domain, then the deployment URL. Indexing is still disabled with NEXT_PUBLIC_ALLOW_INDEXING=false; review flags have not been changed. No ads, analytics, database or monitoring service was activated.

## Redeployment

Use Node 24 and run from the project folder:

```sh
npx --yes vercel@59.16.0 deploy --prod --scope abhiiishek2000s-projects
```

This is a direct CLI deployment. No Git repository is connected, so code changes do not deploy automatically. This first successful deployment is the initial rollback reference; record the next deployment ID before promoting a later version. Roll back through the Vercel dashboard and recheck the health endpoint and a tool workflow.

Custom domains, final public contact/legal copy, content review and indexing, production monitoring, and Search Console remain separate launch tasks. The website is publicly reachable but currently asks search engines not to index it.
