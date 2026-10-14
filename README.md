# Sanity Forge

Sanity Forge is a Next.js and Sanity template for sites that share a codebase and content dataset. The request hostname selects the site. Each site has its own Studio workspace, pages, navigation, and languages.

The example configuration has two sites. Brand A serves English, German, and French. Brand B serves English and German. Both use the blocks in `packages/blocks`.

Studio workspaces filter the editing interface. They do not restrict access to documents in the dataset. Use this setup for sites managed by one team. Public datasets expose all published documents through the Sanity API.

## Run locally

Use pnpm 12.9.1, the version pinned in `package.json`. pnpm downloads Node 24 for the workspace. If you use Corepack to start pnpm, use Corepack 0.34.5 or newer.

1. Install dependencies and copy the environment examples.

   ```sh
   pnpm install
   cp apps/studio/.env.example apps/studio/.env
   cp apps/web/.env.example apps/web/.env
   ```

2. Set the Sanity project ID and dataset in both files. The examples use `production`. Use a separate dataset for development.

   To create one in your configured project, run:

   ```sh
   pnpm --filter studio exec sanity login
   pnpm --filter studio exec sanity dataset create development
   ```

   Set `SANITY_STUDIO_DATASET=development` in the Studio file and `NEXT_PUBLIC_SANITY_DATASET=development` in the web file.

3. Create a Viewer token in the Sanity project's API settings. Set `SANITY_API_READ_TOKEN` in `apps/web/.env`. The web app requires this token for Sanity Live and previews. Authenticated Draft Mode sessions receive it in the browser, so use a Viewer token.

4. Add the local origins to the Sanity project's CORS configuration with credentials enabled.

   ```sh
   pnpm --filter studio exec sanity cors add http://localhost:3333 --credentials
   pnpm --filter studio exec sanity cors add http://localhost:3000 --credentials
   pnpm --filter studio exec sanity cors add http://brand-a.localhost:3000 --credentials
   pnpm --filter studio exec sanity cors add http://brand-b.localhost:3000 --credentials
   ```

5. Generate types and start the apps.

   ```sh
   pnpm typegen
   pnpm dev
   ```

Open [Brand A](http://brand-a.localhost:3000), [Brand B](http://brand-b.localhost:3000), [Studio](http://localhost:3333), or [Storybook](http://localhost:6006). Plain `localhost:3000` serves `DEFAULT_SITE`, which defaults to Brand A.

An empty dataset shows the site's 404 page. Create and publish a page with slug `/` in Studio, or [import the demo content](docs/development.md#import-demo-content).

For a Vercel-linked app, `vercel env pull apps/web/.env.local` downloads the web environment. Values in `.env.local` override `.env`. Configure Studio separately.

## Work on the project

Run commands from the repository root.

| Command | Result |
| --- | --- |
| `pnpm dev:web` | Start the frontend |
| `pnpm dev:studio` | Start Studio |
| `pnpm dev:storybook` | Start Storybook |
| `pnpm verify` | Check formatting, lint, workspace dependencies, package boundaries, unit tests, and types |
| `pnpm fix` | Apply formatting and lint fixes |
| `pnpm typegen` | Extract the Studio schema and generate GROQ result types |
| `pnpm build` | Build the apps that define a build script. The web build reads Sanity content. |
| `pnpm test:e2e` | Build the web app and run Playwright against its production server |

The guides cover the remaining workflows:

- [Development](docs/development.md) covers adding sites and blocks, importing demo content, and running checks.
- [Content and rendering](docs/content-model.md) describes document scope, localized links, previews, caching, and browser integrations.
- [Deployment](docs/deployment.md) covers Vercel, Studio, publish invalidation, and CI configuration.
- [Documentation inventory](docs/documentation.md) lists the documentation and prose sources in the repository.
- [AGENTS.md](AGENTS.md) contains the repository's coding and validation rules.

## License

The code uses the [MIT License](LICENSE). [Third-party notices](THIRD_PARTY_NOTICES.md) credit the projects it adapts. The demo dataset includes separately licensed Wikipedia text and Met images, with attribution in the content.
