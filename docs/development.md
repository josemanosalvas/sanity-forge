# Develop sites and blocks

Complete the [local setup](../README.md#run-locally) before running these commands.

## Add a site or language

1. Add the site key, name, domains, and locales to [`sites.ts`](../packages/internationalization/src/sites.ts). The first locale is the default and has no URL prefix. Keep the key stable because Sanity documents store it.
2. For a new language, add its code, label, and region to [`locales.ts`](../packages/internationalization/src/locales.ts). Add a message file in [`messages/`](../packages/internationalization/messages/) and its loader in [`request.ts`](../packages/internationalization/src/request.ts).
3. Register the site's development and production origins in Sanity CORS with credentials enabled. `getAllSiteOrigins()` in `sites.ts` lists the configured site origins.
4. Open the site's workspace in Studio. The Studio configuration creates a workspace for each registry entry. Create its settings, navigation, footer, and pages there.
5. Attach the production domain to the web deployment. Rebuild the web app and Studio after changing the registry.

See [Content and rendering](content-model.md) for document IDs and link behavior.

## Add a block

1. Run the generator.

   ```sh
   pnpm turbo gen block
   ```

2. Edit the renderer, schema, query, Markdown serializer, and story in `packages/blocks/src/blocks/<name>/`.
3. Register the renderer in [`page-blocks.tsx`](../apps/web/src/components/page-blocks.tsx). The generator registers the schema, GROQ projection, and Markdown serializer.
4. Add tests for the block's behavior. Check the story in Storybook.
5. Run `pnpm typegen` after changing schemas or queries. Commit the generated `apps/studio/schema.json` and `packages/sanity/src/sanity.types.ts` when they change.
6. Run `pnpm verify`. For changes to preview behavior, also check the block in an authenticated Studio Presentation session.

Import blocks through their package exports, such as `@repo/blocks/hero`. To create a separate workspace package, use `pnpm turbo gen package`.

## Import demo content

The demo contains pages about Post-Impressionism and Vincent van Gogh for Brand A, and ukiyo-e and Hokusai for Brand B. It includes each site's configured languages, navigation, footer, settings, and translation links.

Images come from The Met's Open Access collection under CC0. Text comes from Wikipedia introductions under CC BY-SA 4.0. Pages and footers include attribution.

1. Set `SANITY_STUDIO_PROJECT_ID` in `apps/studio/.env`.
2. Log in and create the demo dataset once. For unattended imports, use `SANITY_IMPORT_TOKEN` with write access instead of logging in.

   ```sh
   pnpm --filter studio exec sanity login
   pnpm --filter studio exec sanity dataset create demo --visibility public
   ```

3. Import the committed dataset.

   ```sh
   pnpm seed
   ```

   The import reads [`dataset.ndjson`](../apps/studio/seed/dataset.ndjson) and uploads its referenced images. It replaces seeded published documents by ID. It leaves drafts and documents absent from the seed unchanged. Existing drafts can therefore hide the newly imported published content in Studio.

   To import into a different dataset, set `SANITY_STUDIO_SEED_DATASET` when running the command.

4. Set `SANITY_STUDIO_DATASET=demo` in the Studio environment and `NEXT_PUBLIC_SANITY_DATASET=demo` in the web environment. Restart the apps.

To change the demo selection, edit [`manifest.ts`](../apps/studio/seed/manifest.ts) and run `pnpm seed:build`. The builder fetches Met records and Wikipedia introductions. It rejects works that The Met does not mark public domain and articles that resolve to an unexpected Wikidata item. Review and commit the regenerated NDJSON because upstream text and records can change.

## Run checks

Run `pnpm verify` before submitting changes. It checks formatting, lint, workspace dependencies, package boundaries, unit tests, and types.

To run one package's Vitest tests, use its package name:

```sh
pnpm --filter @repo/blocks test
pnpm --filter web test
```

For browser checks, install Chromium and run Playwright:

```sh
pnpm --filter web exec playwright install chromium
pnpm test:e2e
```

The web build requires a working Sanity project and Viewer token. The smoke tests check site layouts, locales, 404s, robots, and sitemaps with an empty dataset. To require published home pages too, run `E2E_HAS_CONTENT=true pnpm test:e2e`.

Check Presentation and release previews manually in an authenticated Studio session when those behaviors change.
