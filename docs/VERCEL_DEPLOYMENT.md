# Vercel deployment

Deployed September 12, 2026.

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
