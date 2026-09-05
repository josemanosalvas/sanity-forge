<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `apps/web/node_modules/next/dist/docs/`. The installed docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Repository contracts

- Site configuration lives in `packages/internationalization/src/sites.ts`. Public URLs have no site prefix; CMS reads must include site and locale.
- GROQ link projections already include the destination locale. Use `next/link` for them; use the internationalization `Link` for app-authored, unprefixed paths.
- Keep Sanity fetches inside `use cache`; resolve preview cookies outside and pass perspective, stega and variant as props. Preserve stega-branded result types.
- Edit schemas and queries, then run `pnpm typegen`. Do not hand-edit `apps/studio/schema.json` or `packages/sanity/src/sanity.types.ts`.
- Packages keep source under `src/`: React components in `src/components`, hooks in `src/hooks`, helpers in `src/lib`. Blocks are vertical folders (`src/<block>/`) and share code through `@repo/blocks/components/*` and `@repo/blocks/lib/*`.
- Import concrete modules through `package.json` exports. Do not add barrel files (re-export-only modules such as `index.ts`); registries that build an array or a projection are fine.

# Verification

- Run focused tests while editing: `pnpm --filter studio test`, `pnpm --filter web test` or `pnpm --filter @repo/blocks test`.
- Run `pnpm verify` before finishing. On an unconfigured checkout, prefix it with `SANITY_STUDIO_PROJECT_ID=placeholder SANITY_STUDIO_DATASET=production NEXT_PUBLIC_SANITY_PROJECT_ID=placeholder NEXT_PUBLIC_SANITY_DATASET=production`.
- For routing, caching or rendering changes, run `pnpm turbo run build --filter=web` and `pnpm test:e2e` with a real Sanity project and Viewer token. Report unavailable checks explicitly.
- Verify published and Draft Mode separately for preview changes. Add regressions for behavior; avoid tests of mocks, implementation spelling or unused helpers.
