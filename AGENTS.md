<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `apps/web/node_modules/next/dist/docs/`. The installed docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Repository contracts

- Site configuration lives in `packages/internationalization/src/sites.ts`. Public URLs have no site prefix; CMS reads must include site and locale.
- GROQ link projections already include the destination locale. Use `next/link` for them; use the internationalization `Link` for app-authored, unprefixed paths.
- Keep Sanity fetches inside `use cache`; resolve preview cookies outside and pass perspective, stega and variant as props. Preserve stega-branded result types.
- Edit schemas and queries, then run `pnpm typegen`. Do not hand-edit `apps/studio/schema.json` or `packages/sanity/src/sanity.types.ts`.
- Packages keep source under `src/`: React components in `src/components`, hooks in `src/hooks`, helpers in `src/lib`. The blocks package adds `src/blocks/<block>/`: a vertical folder whose renderer is named after the folder (`@repo/blocks/cta` resolves to `src/blocks/cta/cta.tsx`) beside `schema.ts`, `query.ts`, `markdown.ts`, tests and stories; code shared across blocks lives in `src/components`, `src/hooks` and `src/lib` (`@repo/blocks/components/*`, `@repo/blocks/lib/*`).
- Import concrete modules through `package.json` exports. Do not add barrel files (re-export-only modules such as `index.ts`); registries that build an array or a projection are fine.
- Components are Server Components unless they call a hook, attach a handler or use a browser API; keep client boundaries small and pass server-rendered elements as props or children. For translated block labels, use `@repo/blocks/components/labels`.
- CMS images render through `@repo/blocks/components/sanity-image` against the Sanity CDN (resizing, `auto=format`, hotspot and crop); `next/image` is not used. Mark the page's one LCP candidate with `loading="eager"` and `fetchPriority="high"` (never both theme variants), give every other image `sizes`, and pass `mode="cover"` on fixed-shape boxes so the editor's hotspot applies.
- All Sanity reads go through `apps/web/src/lib/content.ts` or `packages/sanity/src/live.ts`; independent reads are batched with `Promise.all`, and every outer `use cache` scope (layout, page, structured data) sets `cacheLife("sanity")`; the inner helpers in `content.ts` and `live.ts` inherit it.
- `partialPrefetching` stays off: the single catch-all route awaits its params outside Suspense so a missing page can return HTTP 404, which leaves no App Shell to prefetch. Revisit only together with that contract.
- `typedRoutes` stays off: public hrefs are proxy-rewritten paths the router never sees.

# Verification

- Run focused tests while editing: `pnpm --filter studio test`, `pnpm --filter web test` or `pnpm --filter @repo/blocks test`.
- Run `pnpm verify` before finishing. On an unconfigured checkout, prefix it with `SANITY_STUDIO_PROJECT_ID=placeholder SANITY_STUDIO_DATASET=production NEXT_PUBLIC_SANITY_PROJECT_ID=placeholder NEXT_PUBLIC_SANITY_DATASET=production`.
- For routing, caching or rendering changes, run `pnpm turbo run build --filter=web` and `pnpm test:e2e` with a real Sanity project and Viewer token. Report unavailable checks explicitly.
- Verify published and Draft Mode separately for preview changes. Add regressions for behavior; avoid tests of mocks, implementation spelling or unused helpers.
