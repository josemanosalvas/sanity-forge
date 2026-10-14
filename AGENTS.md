# Repository instructions

<!-- BEGIN:nextjs-agent-rules -->

## Read Next.js docs before coding

Before any Next.js work, find and read the relevant doc in `apps/web/node_modules/next/dist/docs/`. The installed docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## Read Sanity docs before coding

Before changing schemas, GROQ, TypeGen, Visual Editing, or Studio, read the relevant documentation. Use these sources in order:

1. The Sanity MCP server's documentation tools, when configured. Configure the server with `npx sanity@latest mcp configure`.
2. The installed packages for the pinned versions in `apps/studio/node_modules/sanity` and `apps/web/node_modules/next-sanity`.
3. [Sanity docs](https://www.sanity.io/docs). Search with `pnpm --filter studio exec sanity docs search "<query>"`, then read with `pnpm --filter studio exec sanity docs read <path>`.

## Repository layout

Sanity Forge uses pnpm and Turborepo for a multilingual, multi-site content website template.

- `apps/web`: Next.js App Router frontend. Routes and components live in `src/`, and Playwright tests live in `tests/e2e/`.
- `apps/studio`: Sanity schemas, editing structure, and preview configuration.
- `apps/storybook`: UI and page-builder story development.
- `apps/blueprint`: Sanity Blueprint and the `invalidate-tags` Function that forwards publish sync tags to `/api/revalidate`. Deploy it separately with the Sanity CLI.
- `packages/blocks/src/blocks/<name>/`: block renderers, schemas, queries, Markdown serializers, tests, and stories.
- `packages/ui`: shared components and styles. Other packages provide Sanity access, internationalization, SEO, security, analytics, and observability.
- `packages/internationalization/messages/`: translations for interface text.
- `tooling/`: shared configuration.
- `turbo/generators/`: templates for blocks and packages.

## Commands

Use pnpm 12.9.1, which provisions Node 24. If you use Corepack to start pnpm, use Corepack 0.34.5 or newer.

- `pnpm install`: install workspace dependencies.
- `pnpm dev`: start web on port 3000, Studio on 3333, and Storybook on 6006. Use `pnpm dev:web` to run the frontend.
- `pnpm build`: build applications. The web build needs working Sanity credentials.
- `pnpm verify`: check formatting, lint, workspace dependencies, package boundaries, unit tests, and types.
- `pnpm fix`: apply Ultracite lint and formatting fixes.
- `pnpm typegen`: extract Sanity schemas and regenerate GROQ result types after schema or query changes.
- `pnpm turbo gen block`: generate a block and register its schema, projection, and Markdown serializer. Add its web renderer and behavior tests.

## Code style

Use TypeScript and React function components. Use two-space indentation, double quotes, and semicolons. Ultracite configures Oxlint and Oxfmt. Use kebab-case filenames and PascalCase component names.

Import concrete package exports such as `@repo/blocks/hero` and respect dependency boundaries. Regenerate `schema.json` and `sanity.types.ts` rather than editing them manually.

## Tests

Use Vitest for colocated `*.test.ts` and `*.test.tsx` tests. Run all tests with `pnpm test`, or one package with `pnpm --filter @repo/blocks test`. Add regression tests for changed behavior. The repository has no numeric coverage threshold.

Run Playwright tests against the production server with `pnpm test:e2e`. Check authenticated Studio previews manually when affected.

## Commits and pull requests

Use concise, action-oriented commit subjects. Explain behavior changes, link relevant issues, and report validation in pull requests. Include screenshots for visual changes. Run `pnpm verify` and commit regenerated schemas and types when they change.

## Configuration

Copy each app's `.env.example` to `.env` and configure Sanity locally. Never commit tokens. Keep site domains and locales in `packages/internationalization/src/sites.ts`. Studio workspace filters organize content but do not enforce tenant permissions.

Setup and operational instructions are linked from [README.md](README.md). [Documentation inventory](docs/documentation.md) lists the prose sources, including schema help and Storybook examples.
