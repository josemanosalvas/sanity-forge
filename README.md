# Sanity Forge

A production-grade Next.js + Sanity template for multilingual content sites. One deployment and Sanity dataset serve multiple domains, with a Studio workspace per site, localized pages, shared page-builder blocks, live previews and per-site SEO.

Use it for sites managed by one team. Workspace filters organize editing; they do not enforce tenant permissions. Independently operated clients need a separate access-control or dataset strategy.

## Setup

Requires pnpm 11 and a Sanity project with a dataset. pnpm provisions Node 24 from `devEngines.runtime`.

```bash
pnpm install
cp apps/studio/.env.example apps/studio/.env
cp apps/web/.env.example apps/web/.env
```

Fill in the project ID and dataset in both files. Set `SANITY_API_READ_TOKEN` to a Viewer token from the project's API settings; Sanity Live and previews require it.

On a Vercel-linked checkout, `vercel env pull apps/web/.env.local` replaces the manual copy; Next loads `.env.local` ahead of `.env`. Env files live beside each app's `package.json`, never at the repository root, and are read at startup: restart `pnpm dev` after editing them.

```bash
pnpm typegen
pnpm dev
```

Web runs on port 3000, Studio on 3333 and Storybook on 6006. Use `brand-a.localhost:3000` or `brand-b.localhost:3000`; plain `localhost:3000` serves `DEFAULT_SITE`. Stale-module or Turbopack cache errors clear with `pnpm clean:workspaces && pnpm clean && pnpm install`.

## Sites and content

Configure domains and locales in [`sites.ts`](packages/internationalization/src/sites.ts). To add a site, add a registry entry and create its settings in Studio. New locales also need messages in `packages/internationalization/messages/` and a loader in `src/request.ts`.

Public URLs have no site prefix. The default locale is unprefixed (`/pricing`); other locales are prefixed (`/de/preise`). CMS slugs are localized per document.

| Document | Scope |
| --- | --- |
| `page` | Site and locale; slug `/` is the home page |
| `navigation`, `footer` | One per site and locale, at `navigation-<site>-<locale>` and `footer-<site>-<locale>` |
| `settings` | One per site, at `settings-<site>`, with localized string fields |
| `faq` | Localized per document, shared across sites; links by address, never to one site's page |
| `redirect` | Site; applied at build time |

GROQ-projected links already include the destination locale: render them with `next/link`. Use `@repo/internationalization/navigation`'s `Link` for app-authored paths without locale prefixes.

Navigation, footer and settings are singletons: their IDs derive from the site and locale (`@repo/blocks/lib/singletons`), the Studio opens those documents directly instead of listing them, the queries read them by ID, the duplicate action is off, and a document under any other ID fails validation and appears under "Not shown on the site".

Links never cross sites. The Studio offers a document only its own site's pages, and a reference that still points at another site's page (a page moved after it was linked) projects as `null` and renders as a broken link. Shared content (FAQs) is shown on several sites, so it links by address instead: a path such as `/about` opens on whichever site shows it, a full URL pins one site.

## Development

- `apps/web`: Next.js App Router frontend.
- `apps/studio`: Sanity schemas, editing structure and Presentation configuration.
- `apps/storybook`: UI and block stories.
- `packages/blocks`: each `src/blocks/<name>/` contains its renderer, schema, query, Markdown serializer, tests and stories. Shared components, hooks and helpers sit alongside `blocks/` under `src/`.
- `packages/ui`: shadcn primitives, styles and theme provider.
- Other packages provide Sanity access, internationalization, SEO, security, analytics and observability. `tooling/` holds shared configuration.

Import concrete modules through package exports, such as `@repo/blocks/hero` or `@repo/seo/route`. Repository contracts and verification requirements are in [AGENTS.md](AGENTS.md).

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run all apps |
| `pnpm build` | Build all apps; web needs working Sanity credentials |
| `pnpm verify` | Formatting, lint, workspace and dependency boundaries, tests, typecheck |
| `pnpm fix` | Apply lint and format fixes |
| `pnpm typegen` | Extract schemas and regenerate GROQ result types |
| `pnpm --filter <package> test` | Focused Vitest tests (`web`, `studio`, `@repo/blocks`) |
| `pnpm test:e2e` | Playwright against the production web server |
| `pnpm turbo gen block` | Scaffold and register a block; add its web renderer and behavior tests |
| `pnpm turbo gen package` | Scaffold a workspace package |

### Third-party scripts

Every external script is loaded by a maintained integration and can be switched off with a public key; the Loading column states when each runs. See `apps/web/.env.example`.

| Provider | Origins | Purpose | Loading | Key |
| --- | --- | --- | --- | --- |
| Vercel Web Analytics | own origin (`/_vercel/insights`) | page views, custom events | `@vercel/analytics/next`, after hydration | `NEXT_PUBLIC_VERCEL_ANALYTICS` (on) |
| Vercel Speed Insights | own origin (`/_vercel/speed-insights`) | real-user LCP, INP, CLS | `@vercel/speed-insights/next`, after hydration | `NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS` (on) |
| Google Analytics | `googletagmanager.com`, `google-analytics.com` | page views | `@next/third-parties/google`, after hydration | `NEXT_PUBLIC_GA_MEASUREMENT_ID` (off) |
| Sentry | `*.ingest.sentry.io` through the `/monitoring` tunnel | errors, traces; Session Replay opt-in | `instrumentation-client.ts`, before hydration | `NEXT_PUBLIC_SENTRY_DSN` (off) |
| Mux | `stream.mux.com`, `image.mux.com` | video playback and stills | dynamic import on play; Mux Data off | per block |
| Sanity Live | `*.api.sanity.io` | content updates | `next-sanity/live`, every page | always |

Performance targets are the Core Web Vitals field thresholds, read from Speed Insights at the 75th percentile over 28 days with mobile and desktop separate: LCP under 2.5 s, INP under 200 ms, CLS under 0.1. The LCP element is the leading hero's poster (`packages/blocks/src/blocks/hero/hero.tsx`); INP is governed by the client bundle, which the page builder keeps to interactive leaves; CLS is prevented by explicit image dimensions, `next/font` fallbacks and reserved Suspense fallbacks.

Draft Mode exits through the preview bar's Server Action; `POST /api/draft-mode/disable?to=/path` is the equivalent endpoint for tooling outside the site.

The newsletter block needs an `action` or `onSubmit` handler to render a subscription form. The strings blocks render themselves (form labels, the copy and play buttons, screen-reader text) come from the `blocks` namespace of `packages/internationalization/messages/` through `BlockLabelsProvider` (`@repo/blocks/components/block-labels`), which the layout mounts; without a provider, as in Storybook, the English defaults apply. Markdown serializers are available per block; there is no Markdown HTTP route.

## Caching and previews

Sanity reads run inside `use cache`. Resolve preview cookies outside the cache and pass `perspective`, `stega` and `variant` through to the cached layer. Shared fetch helpers live in [`content.ts`](apps/web/src/lib/content.ts); preview resolution and Live integration live in [`live.ts`](packages/sanity/src/live.ts). The layering and names follow Sanity's official Next.js template.

For revalidation when no browser has Sanity Live open, configure a GROQ-powered webhook:

| Setting           | Value                                               |
| ----------------- | --------------------------------------------------- |
| URL               | `https://your-site/api/revalidate`                  |
| Method / triggers | POST; create, update, delete; draft events disabled |
| Projection        | `{_type, site}`                                     |
| Secret            | Same as `SANITY_REVALIDATE_SECRET` (32+ characters) |

Filter:

```groq
_type in ["page", "settings", "navigation", "footer", "faq", "translation.metadata", "sanity.imageAsset", "sanity.fileAsset", "mux.videoAsset"]
```

Site documents invalidate that site's reads; shared documents invalidate all sites. The next request can receive stale content while the cache refreshes. Redirect edits require a rebuild.

## Deployment

One Vercel project serves every hostname in `sites.ts`; attach all production domains to it and `DEFAULT_SITE` answers preview URLs. Settings:

| Setting | Value |
| --- | --- |
| Root Directory | repository root (empty): the web build runs the Studio's schema extraction through Turborepo |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm turbo run build --filter=web` |
| Output Directory | `apps/web/.next` |
| Node.js | 24.x (`.node-version`) |

Environment variables: everything in `apps/web/.env.example` marked required, plus `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` for the build, `NEXT_PUBLIC_SANITY_STUDIO_URL` set to the deployed Studio origin (a loopback value is dropped from the frame-ancestors policy), and `SANITY_REVALIDATE_SECRET` (at least 32 characters; shorter values are refused by the route) if the webhook is used. Unauthenticated requests to the webhook and the Draft Mode handshake are rate-limited per client address; signed deliveries and valid handshakes never are. `SANITY_API_READ_TOKEN` must be a Viewer token: validated Draft Mode sessions receive it in the browser for Sanity Live. Behind another reverse proxy, that proxy must overwrite `x-forwarded-host`, which is what resolves the site. Requests on a site's `www.`/apex twin are redirected to the production hostname with a 308.

## CI and verification

[CI](.github/workflows/ci.yml) runs static checks, unit tests, TypeGen freshness, and Studio/Storybook builds using a placeholder project. Set repository variables `SANITY_PROJECT_ID`, `SANITY_DATASET` and secret `SANITY_API_READ_TOKEN` to enable the web build and Playwright tests; that job records the route table in the job summary, fails if the CMS page is no longer prerendered, and checks that the Viewer token never reaches the build output. Fork PRs run checks that need no secrets.

The smoke suite covers site shells, locales, 404s, robots and sitemaps with an empty dataset. Set `E2E_HAS_CONTENT=true` to require published home pages too. Check Presentation and release previews manually in an authenticated Studio session.

## License

MIT. See [LICENSE](LICENSE). Portions are adapted from [turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity), [next-forge](https://github.com/vercel/next-forge) and [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo); their notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
