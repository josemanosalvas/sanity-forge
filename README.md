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

```bash
pnpm typegen
pnpm dev
```

Web runs on port 3000, Studio on 3333 and Storybook on 6006. Use `brand-a.localhost:3000` or `brand-b.localhost:3000`; plain `localhost:3000` serves `DEFAULT_SITE`.

## Sites and content

Configure domains and locales in [`sites.ts`](packages/internationalization/src/sites.ts). To add a site, add a registry entry and create its settings in Studio. New locales also need messages in `packages/internationalization/messages/` and a loader in `src/request.ts`.

Public URLs have no site prefix. The default locale is unprefixed (`/pricing`); other locales are prefixed (`/de/preise`). CMS slugs are localized per document.

| Document               | Scope                                       |
| ---------------------- | ------------------------------------------- |
| `page`                 | Site and locale; slug `/` is the home page  |
| `navigation`, `footer` | Expected once per site and locale           |
| `settings`             | One per site, with localized string fields  |
| `faq`                  | Localized per document, shared across sites |
| `redirect`             | Site; applied at build time                 |

GROQ-projected links already include the destination locale: render them with `next/link`. Use `@repo/internationalization/navigation`'s `Link` for app-authored paths without locale prefixes.

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

Sentry and Google Analytics activate when configured in `apps/web/.env`. Vercel Analytics is enabled by default; disable it with `NEXT_PUBLIC_VERCEL_ANALYTICS=false`. See the `.env.example` files for all options.

The newsletter block needs an `action` or `onSubmit` handler to render a subscription form. Markdown serializers are available per block; there is no Markdown HTTP route.

## Caching and previews

Sanity reads run inside `use cache`. Resolve preview cookies outside the cache and pass `perspective`, `stega` and `variant` through to the cached layer. Shared fetch helpers live in [`content.ts`](apps/web/src/lib/content.ts); preview resolution and Live integration live in [`live.ts`](packages/sanity/src/live.ts). The layering and names follow Sanity's official Next.js template.

For revalidation when no browser has Sanity Live open, configure a GROQ-powered webhook:

| Setting           | Value                                               |
| ----------------- | --------------------------------------------------- |
| URL               | `https://your-site/api/revalidate`                  |
| Method / triggers | POST; create, update, delete; draft events disabled |
| Projection        | `{_type, site}`                                     |
| Secret            | Same as `SANITY_REVALIDATE_SECRET`                  |

Filter:

```groq
_type in ["page", "settings", "navigation", "footer", "faq", "translation.metadata", "sanity.imageAsset", "sanity.fileAsset", "mux.videoAsset"]
```

Site documents invalidate that site's reads; shared documents invalidate all sites. The next request can receive stale content while the cache refreshes. Redirect edits require a rebuild.

## CI and verification

[CI](.github/workflows/ci.yml) runs static checks, unit tests, TypeGen freshness, and Studio/Storybook builds using a placeholder project. Set repository variables `SANITY_PROJECT_ID`, `SANITY_DATASET` and secret `SANITY_API_READ_TOKEN` to enable the web build and Playwright tests. Fork PRs run checks that need no secrets.

The smoke suite covers site shells, locales, 404s, robots and sitemaps with an empty dataset. Set `E2E_HAS_CONTENT=true` to require published home pages too. Check Presentation and release previews manually in an authenticated Studio session.

## License

MIT. See [LICENSE](LICENSE). Portions are adapted from [turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity), [next-forge](https://github.com/vercel/next-forge) and [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo); their notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
