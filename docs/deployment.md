# Deploy the sites

## Configure the web deployment

1. Replace the example production domains in [`sites.ts`](../packages/internationalization/src/sites.ts). Attach every production hostname to one Vercel project. `DEFAULT_SITE` selects the site for preview URLs.
2. Configure Vercel to build from the repository root. Schema extraction runs from `apps/studio` during the web build.

   | Setting          | Value                               |
   | ---------------- | ----------------------------------- |
   | Root directory   | Repository root                     |
   | Install command  | `pnpm install --frozen-lockfile`    |
   | Build command    | `pnpm turbo run build --filter=web` |
   | Output directory | `apps/web/.next`                    |
   | Node.js version  | 24, matching the workspace runtime  |

3. Set the required values from [`apps/web/.env.example`](../apps/web/.env.example) in the deployment environment. Also set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` for schema extraction.
4. Set `NEXT_PUBLIC_SANITY_STUDIO_URL` to the deployed Studio origin. Production security headers exclude loopback origins from the framing policy.
5. Use a Viewer token for `SANITY_API_READ_TOKEN`. Authenticated Draft Mode sessions receive it in the browser for Sanity Live.
6. If you use the invalidation Function below, set `SANITY_REVALIDATE_SECRET` to at least 32 characters. Generate a value with `openssl rand -base64 32` and use the same value in the web app and Function.
7. Add production web domains, preview deployment origins, and the Studio origin to [Sanity CORS](https://www.sanity.io/docs/content-lake/cors) with credentials enabled. Server rendering alone does not verify browser access.

   ```sh
   pnpm --filter studio exec sanity cors add https://your-site.example --credentials
   ```

   Replace the example origin and repeat for each deployed origin. Presentation also checks [`allowOrigins`](../apps/studio/presentation/index.ts), independently of API CORS.

8. If a reverse proxy fronts the app, configure it to overwrite `x-forwarded-host` and `x-forwarded-for`. The app uses them for site selection and rate limiting. Requests to a site's alternate `www.` or apex hostname receive a 308 redirect to its configured production hostname.
9. Deploy the web app and check both sites, including their localized pages.

The revalidation route limits an address after 30 unauthorized requests per minute. Draft Mode limits an address after 20 failed handshakes per minute. Successful requests do not consume either limit, but a blocked address receives HTTP 429 before authentication until its window resets. The limits apply per server instance.

For a private dataset, run the following command with your dataset name. The web client uses the configured Viewer token for server reads.

```sh
pnpm --filter studio exec sanity dataset visibility set <dataset> private
```

## Deploy Studio

1. Configure [`apps/studio/.env.example`](../apps/studio/.env.example) as `apps/studio/.env` for the target project and dataset.
2. Run `pnpm --filter studio exec sanity deploy`.
3. Set `SANITY_STUDIO_APP_ID` to the app ID from the first deployment so later deployments target the same Studio.
4. Confirm that the web app's `NEXT_PUBLIC_SANITY_STUDIO_URL` and Sanity CORS entries match the deployed origin.
5. Check Presentation and release previews while signed in to Studio. Studio builds use production preview origins unless `SANITY_STUDIO_PREVIEW_ENVIRONMENT` overrides them.

## Deploy publish invalidation

Deploy the Blueprint separately from the web app. Sanity allows one sync tag Function per dataset.

1. Copy `apps/blueprint/.env.example` to `apps/blueprint/.env`. Set `SANITY_PROJECT_ID` and `SANITY_DATASET`.
2. Log in with a role that can deploy Studios.

   ```sh
   pnpm --filter blueprint exec sanity login
   ```

3. Initialize the stack once, then inspect and deploy the plan. Replace `<project-id>` with your project ID.

   ```sh
   pnpm --filter blueprint exec sanity blueprints init --project-id <project-id> --stack-name production
   pnpm --filter blueprint exec sanity blueprints plan
   pnpm --filter blueprint exec sanity blueprints deploy
   ```

4. Set the Function environment. Replace the URL and secret with the values for the web deployment.

   ```sh
   pnpm --filter blueprint exec sanity functions env add invalidate-tags REVALIDATE_URL https://your-site.example/api/revalidate
   pnpm --filter blueprint exec sanity functions env add invalidate-tags SANITY_REVALIDATE_SECRET <web-app-secret>
   ```

5. Publish a document and check the Function logs.

   ```sh
   pnpm --filter blueprint exec sanity functions logs invalidate-tags
   ```

   The Function acknowledges invalidation only after the web endpoint accepts every batch. The cache refreshes on subsequent reads, as described in [Previews and caching](content-model.md#previews-and-caching).

6. Remove any old GROQ-powered webhook targeting `/api/revalidate`. That route accepts bearer-authenticated sync tags and purge requests, not signed webhook payloads.

## Recover from missed invalidations

Set `SANITY_REVALIDATE_SECRET` in your shell to the web app's secret. To mark one site's cached reads as stale, run:

```sh
curl -X POST https://your-site.example/api/revalidate \
  -H "Authorization: Bearer $SANITY_REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"purge": true, "site": "brand-a"}'
```

Omit `site` to invalidate reads for every site. The next request can receive stale content while the cache refreshes. Set `SANITY_LOG_READS=true` on the web server to inspect cache misses and their sync tags.

## Configure CI

[CI](../.github/workflows/ci.yml) runs static checks, unit tests, TypeGen freshness checks, schema validation, and Studio and Storybook builds with a placeholder Sanity project.

To enable the web build and Playwright job, set repository variables `SANITY_PROJECT_ID` and `SANITY_DATASET`, plus the secret `SANITY_API_READ_TOKEN`. Set `E2E_HAS_CONTENT=true` as a repository variable if the dataset has published home pages.

The web job checks CMS prerendering and scans the build output for the Viewer token. Pull requests from forks run the checks that do not require secrets.
