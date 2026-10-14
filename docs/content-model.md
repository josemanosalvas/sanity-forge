# Content and rendering

## Sites and URLs

[`sites.ts`](../packages/internationalization/src/sites.ts) defines site keys, hostnames, and locales. The proxy selects the site from the hostname, then the locale from the path. Unrecognized hosts use `DEFAULT_SITE`.

Public URLs contain no site key. The default language uses paths such as `/pricing`. Other languages use a locale prefix, such as `/de/preise`. Each translated page has its own slug. Internal App Router paths include both the site key and locale.

The Studio workspaces share one dataset and schema. Workspace filters organize the editor's document lists. They do not enforce access permissions. A public dataset exposes every published document through the Sanity API. Private datasets require authenticated reads, which the web app makes with its Viewer token.

## Documents

| Type | Scope | Identity |
| --- | --- | --- |
| `page` | Site and locale | Each translation is a document. Slug `/` is the home page. |
| `navigation` | Site and locale | `navigation-<site>-<locale>` |
| `footer` | Site and locale | `footer-<site>-<locale>` |
| `settings` | Site | `settings-<site>`, with localized string fields |
| `faq` | Locale, shared across sites | Each translation is a document. |
| `redirect` | Site | Source and destination are public paths. Changes take effect after a web rebuild. |

Navigation, footer, and settings are singletons. The [singleton helpers](../packages/blocks/src/lib/singletons.ts) determine their IDs. Studio opens those IDs directly, and the queries read them by ID. Studio disables duplication for these types. Documents with other IDs fail validation and appear under "Not shown on the site".

## Links

Page references stay within a site. Studio's reference picker offers pages from the current document's site, in any supported language. If an imported reference points to another site's page, the GROQ projection returns `null` and the renderer shows a broken link.

Shared FAQs use address links. A relative path such as `/about` opens on the site displaying the FAQ. A full URL selects a specific domain.

GROQ-projected links already include the destination's locale prefix. The app renders them with `next/link`. App-authored paths without a locale prefix use `Link` from `@repo/internationalization/navigation`.

## Blocks

Each directory under [`packages/blocks/src/blocks/`](../packages/blocks/src/blocks/) contains a renderer, schema, query, Markdown serializer, and story. The web app registers renderers in [`page-blocks.tsx`](../apps/web/src/components/page-blocks.tsx).

The newsletter block renders a form only when it receives an `action` or `onSubmit` handler. The page builder does not supply one. Its Markdown serializer also omits the form's helper text.

[`BlockLabelsProvider`](../packages/blocks/src/components/block-labels.tsx) supplies translated control labels and accessibility text. The web layout uses the `blocks` namespace in [`messages/`](../packages/internationalization/messages/). Without a provider, Storybook and tests use the English defaults.

Blocks export Markdown serializers. The web app has no Markdown HTTP route.

## Previews and caching

[`content.ts`](../apps/web/src/lib/content.ts) caches Sanity reads with `use cache`. [`live.ts`](../packages/sanity/src/live.ts) resolves preview cookies outside the cache and passes `perspective`, `stega`, and `variant` into cached functions. These arguments distinguish published content, drafts, releases, and editing variants in the cache.

The preview bar exits Draft Mode through a Server Action. External tools can use `POST /api/draft-mode/disable?to=/path`.

Sanity Live receives content changes while a browser has the site open. The [`invalidate-tags` Function](../apps/blueprint/functions/invalidate-tags/index.ts) handles publishes independently of browser connections. It posts sync tags to `/api/revalidate`, then acknowledges successful delivery to Sanity. Failed delivery throws and appears in the Function logs.

The route marks matching reads as stale with `revalidateTag(tag, "max")`. The next request receives the cached content while Next.js refreshes it. Redirects come from build-time configuration and still require a rebuild.

`SANITY_LOG_READS=true` logs each uncached Sanity read with its parameters and sync tags. [Deployment](deployment.md#deploy-publish-invalidation) covers Function setup and manual cache invalidation.

## Browser integrations

The web environment controls these integrations. Defaults and variable names are in [`apps/web/.env.example`](../apps/web/.env.example).

| Integration | Default | Loading and requests |
| --- | --- | --- |
| Vercel Web Analytics | Enabled unless `NEXT_PUBLIC_VERCEL_ANALYTICS=false` | Loads after hydration and sends page views and custom events through `/_vercel/insights`. |
| Vercel Speed Insights | Enabled unless `NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS=false` | Loads after hydration and reports performance through `/_vercel/speed-insights`. |
| Google Analytics | Disabled without `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Loads after hydration through `@next/third-parties/google`. Uses `googletagmanager.com` and `google-analytics.com`. |
| Sentry | Disabled without `NEXT_PUBLIC_SENTRY_DSN` | Initializes before hydration. Browser reports use the `/monitoring` tunnel. Session Replay requires `NEXT_PUBLIC_SENTRY_REPLAY=true`. |
| Mux | Used by video blocks | Imports the adaptive player on play or autoplay. Uses `stream.mux.com` and `image.mux.com`. Mux Data is disabled. |
| Sanity Live | Enabled on site pages | Receives content updates from `*.api.sanity.io`. |
