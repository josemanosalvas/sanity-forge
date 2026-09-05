# Sanity Forge

A **Next.js + Sanity** template for teams running related, multilingual content sites on Turborepo. One codebase, one Sanity project and one Studio serve a configured set of sites, each with its own domain and locales.

The shared site registry, localized references, preview workflows and per-site SEO are the core of the template. Use it when those concerns belong to one team and deployment. Workspace filters organize editing; they do not enforce tenant permissions. Independently operated clients need an explicit Sanity access-control or dataset strategy.

- **Multi-site by host.** `brand-a.example` and `brand-b.example` are resolved from the request host by a synchronous, typed site registry; public URLs never carry a site identifier.
- **Multilingual.** Site and locale are orthogonal. The site's default locale is unprefixed (`/pricing`), the rest are prefixed (`/de/preise`), and CMS slugs are localized per document.
- **Page builder.** Ten shared blocks (hero, CTA, FAQ, feature cards, logo cloud, rich text, showcase grid, social grid, newsletter, video) with colocated schema, GROQ, component, tests, stories and Markdown output.
- **Editorial tooling.** One Studio workspace per site with Presentation, Visual Editing, Draft Mode, Releases, Vision, document- and field-level localization and Sanity TypeGen.
- **Production defaults.** Security headers, SEO (canonical, hreflang, JSON-LD, robots, sitemaps per site), analytics and observability packages that are vendor-neutral or optional.

## Requirements

- pnpm 11 (`corepack enable` or install it globally)
- Node 24: pnpm provisions it from `devEngines.runtime` in `package.json`, so no version manager is needed (`nvm use 24` works too)
- A Sanity project (free tier is fine) with a dataset

## Quick start

```bash
pnpm install

# Studio
cp apps/studio/.env.example apps/studio/.env    # fill in SANITY_STUDIO_PROJECT_ID
# Web
cp apps/web/.env.example apps/web/.env          # fill in NEXT_PUBLIC_SANITY_PROJECT_ID

pnpm typegen        # extracts the schema and generates packages/sanity/src/sanity.types.ts
pnpm dev            # web on :3000, studio on :3333, storybook on :6006
```

Local site domains are `brand-a.localhost:3000` and `brand-b.localhost:3000` (browsers resolve `*.localhost` to loopback). Plain `localhost:3000` serves the site named in `DEFAULT_SITE`.

`SANITY_API_READ_TOKEN` must be a Viewer token from the project's API settings. Sanity Live, Draft Mode, Presentation and Visual Editing all depend on it, and the app refuses to start without it.

## Sites and locales

Sites are declared once, in `packages/internationalization/src/sites.ts`:

| Site      | Locales    | Production host   | Development host         |
| --------- | ---------- | ----------------- | ------------------------ |
| `brand-a` | en, de, fr | `brand-a.example` | `brand-a.localhost:3000` |
| `brand-b` | en, de     | `brand-b.example` | `brand-b.localhost:3000` |

The registry drives the proxy (host to site), the Studio (one workspace per site, Presentation origins), SEO (canonical origin, hreflang) and static generation. To add a site, add an entry there, add its UI messages if it introduces a new locale under `packages/internationalization/messages/`, and create its `settings` document in the Studio.

Every href GROQ projects through `localizedInternalHref` (`urlFragment`, `buttonsFragment` and the rich-text `customLink` mark) already carries the linked page's locale prefix. Render those with `next/link` and use the locale-aware `Link` from `@repo/internationalization/navigation` only for paths the app builds itself, such as `/` or a translation's slug.

Every Sanity document that belongs to a site carries a `site` key. Pages, navigation, footers and FAQs are localized per document (`@sanity/document-internationalization`); site settings use localized string fields (`sanity-plugin-internationalized-array`).

## Repository layout

```
apps/
  web/            Next.js 16 App Router site (proxy → /[site]/[locale]/[[...slug]])
  studio/         Sanity Studio 6, one workspace per site
  storybook/      Storybook 10 for design-system and block stories
packages/
  analytics/      Vercel Analytics + optional Google Analytics
  blocks/         Page-builder blocks: schema, query, component, markdown, tests, stories
  design-system/  shadcn (base-nova) components, Tailwind 4 tokens, theme provider
  internationalization/  Site registry, locale routing, next-intl request config, proxy helpers
  next-config/    Shared next.config factory
  observability/  Logger, error capture, optional Sentry
  sanity/         Client, Live, queries, generated types, TypeGen config
  security/       Security headers and CSP
  seo/            Site × locale × route metadata, alternates, JSON-LD, robots, sitemap
tooling/
  github/         Reusable setup action
  tailwind/       Shared PostCSS config
  typescript/     tsconfig presets
turbo/generators/ `pnpm turbo gen package` and `pnpm turbo gen block`
```

Dependency direction: `blocks → design-system`, `sanity → blocks` (query projections), `web → blocks + sanity`. The design system has no Sanity, analytics or observability dependencies. Packages expose concrete modules through `package.json` exports (`@repo/blocks/hero/hero-block`, `@repo/seo/route`); there are no barrel files, so bundlers only load what a route imports.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | All apps in watch mode |
| `pnpm build` | Builds every app (web needs a Sanity project) |
| `pnpm check` | Lint and format check (Ultracite: Oxlint + Oxfmt) |
| `pnpm fix` | Apply lint and format fixes |
| `pnpm typecheck` | TypeScript across the workspace (runs TypeGen first) |
| `pnpm verify` | Format, lint, workspace checks, tests and typecheck |
| `pnpm typegen` | Extract the Studio schema and regenerate GROQ result types |
| `pnpm test` | Vitest unit and component tests |
| `pnpm test:e2e` | Playwright smoke tests against a production build of `web` |
| `pnpm lint:ws` | Workspace consistency checks (sherif) |
| `pnpm turbo gen block` | Scaffold a page-builder block with all colocated files |
| `pnpm turbo gen package` | Scaffold a `@repo/*` package |

## Environment variables

Each package owns the variables it needs in a `keys.ts` (t3-env) factory; `apps/web/src/env.ts` composes them and `apps/studio/env.ts` validates the Studio's. See `apps/web/.env.example` and `apps/studio/.env.example`. Optional vendors (Sentry, Google Analytics) activate only when their variables are set.

The newsletter block supplies the UI; connect an `action` or `onSubmit` in the web renderer before accepting subscriptions. Without a handler it renders its content without a form. Markdown serializers are available per block; the template does not expose a Markdown HTTP route.

## Data fetching

The web app follows Sanity's three-layer pattern for Cache Components, with the same names as the official template:

1. **Page or Layout** (`Page`, `RootLayout`) awaits only `draftMode()`. Outside Draft Mode it renders the cached layer directly with `perspective="published" stega={false}`: slugs listed by `generateStaticParams` are prerendered, any other slug renders on its first request, and a missing document is a real 404. In Draft Mode it renders the dynamic layer inside `<Suspense>`.
2. **Dynamic** (`DynamicPage`, `DynamicHeader`, `DynamicFooter`) awaits `params` and `getDynamicFetchOptions()`, the only place that reads the preview cookies.
3. **Cached** (`CachedPage`, `CachedHeader`, `CachedFooter`) carries `'use cache'`, takes plain props including `perspective` and `stega`, and reads through the shared `fetch*` helpers in `apps/web/src/lib/content.ts`.

`@repo/sanity/live` exports `SanityLive`, `sanityFetch`, `getDynamicFetchOptions`, `sanityFetchStaticParams` (for `generateStaticParams`) and `sanityFetchMetadata` (for `generateMetadata` and metadata routes). Nothing under `app/` reads `headers()` or `cookies()` outside those helpers.

For updates when no visitor has Sanity Live open, configure a GROQ-powered webhook to `https://your-site/api/revalidate`: POST, create/update/delete triggers, filter `_type in ["page", "settings", "navigation", "footer", "faq", "translation.metadata", "sanity.imageAsset", "sanity.fileAsset", "mux.videoAsset"]`, and projection `{_type}`. Use the same secret as `SANITY_REVALIDATE_SECRET` and leave draft events disabled. It invalidates all site layouts and sitemaps on their next request because shared references can affect multiple sites. Redirect edits still require a rebuild.

## Content model

- `page`: site-scoped, localized per document, with a localized slug and a `pageBuilder` array. The home page is the page whose slug is `/`.
- `navigation`, `footer`: one per site and locale.
- `settings`: one per site, with field-level localized strings.
- `faq`: localized per document, shared across sites.
- `redirect`: site-scoped source/destination pairs applied at build time.

## Continuous integration

`.github/workflows/ci.yml` runs format, lint, workspace checks, typecheck, unit tests, a TypeGen freshness check, and builds the Studio and Storybook with a placeholder project. Set the `SANITY_PROJECT_ID` and `SANITY_DATASET` repository variables and the `SANITY_API_READ_TOKEN` secret to also build the web app and run the Playwright smoke tests. Fork PRs run the checks that need no secrets.

The smoke suite checks both site shells, locales, 404s, robots and sitemaps even with an empty dataset. Set `E2E_HAS_CONTENT=true` locally or as a repository variable to additionally require published home pages. It uses the production server; `next dev` is not a substitute for cache and prerender verification. Presentation and release previews also need a manual check in an authenticated Studio session.

## Acknowledgements

Parts of this template are adapted from [turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity) (MIT, Roboto Studio), [next-forge](https://github.com/vercel/next-forge) (MIT, Vercel) and [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) (MIT, T3 OSS). See `LICENSE`.

## License

MIT
