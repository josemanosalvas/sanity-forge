<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `apps/web/node_modules/next/dist/docs/`. The installed docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

## Project Structure & Module Organization

Sanity Forge is a pnpm/Turborepo monorepo for multilingual, multi-site content websites.

- `apps/web`: Next.js App Router frontend; routes and components live in `src/`, Playwright tests in `tests/e2e/`.
- `apps/studio`: Sanity schemas, editing structure, and preview configuration.
- `apps/storybook`: UI and page-builder story development.
- `packages/blocks/src/blocks/<name>/`: block renderers, schemas, queries, Markdown serializers, tests, and stories.
- `packages/ui`: shared primitives and styles. Other packages provide Sanity access, internationalization, SEO, security, analytics, and observability.
- `packages/internationalization/messages/`: translation assets; `tooling/`: shared configuration; `turbo/generators/`: scaffolding templates.

## Build, Test, and Development Commands

Use pnpm 11; the repository pins pnpm 11.25.0 and provisions Node 24.

- `pnpm install`: install workspace dependencies.
- `pnpm dev`: start web (3000), Studio (3333), and Storybook (6006). Use `pnpm dev:web` to focus on the frontend.
- `pnpm build`: build applications; the web build needs working Sanity credentials.
- `pnpm verify`: run formatting/lint checks, workspace checks, dependency boundaries, unit tests, and typechecking.
- `pnpm fix`: apply Ultracite lint and formatting fixes.
- `pnpm typegen`: extract Sanity schemas and regenerate GROQ result types after schema/query changes.
- `pnpm turbo gen block`: scaffold and register a block; then add its web renderer and behavior tests.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow existing two-space indentation, double quotes, and semicolons; Ultracite configures Oxlint and Oxfmt. Use kebab-case filenames and PascalCase component names. Import concrete package exports such as `@repo/blocks/hero`; respect dependency boundaries. Regenerate `schema.json` and `sanity.types.ts` rather than editing them manually.

## Testing Guidelines

Use Vitest for colocated `*.test.ts` and `*.test.tsx` tests. Run all with `pnpm test`, or focus with `pnpm --filter @repo/blocks test`. No numeric coverage threshold is configured; add behavior-focused regression tests for changes. Run production-server Playwright tests (`*.e2e.ts`) with `pnpm test:e2e`. Check authenticated Studio previews manually when affected.

## Commit & Pull Request Guidelines

History is limited to short descriptive subjects, including `Scaffold Sanity Forge (#1)`; no Conventional Commits pattern is established. Use concise, action-oriented subjects. PRs should explain behavior changes, link relevant issues, report validation, and include screenshots for visual changes. Run `pnpm verify` and commit regenerated schema/types when applicable.

## Security & Configuration

Copy each app’s `.env.example` to `.env` and configure Sanity locally. Never commit tokens. Keep site domains/locales in `packages/internationalization/src/sites.ts`. Studio workspace filters organize content; they do not enforce tenant permissions.
