# Documentation inventory

This inventory covers repository-owned documentation, editor help, examples, and source comments. Dependency documentation in `node_modules` and local build output are outside its scope.

## Documents

| File | Contents |
| --- | --- |
| [README.md](../README.md) | Local setup, common commands, and links to guides |
| [AGENTS.md](../AGENTS.md) | Documentation lookup, code style, and validation rules for coding agents |
| [CLAUDE.md](../CLAUDE.md) | Imports `AGENTS.md` |
| [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) | Attribution for adapted code |
| [LICENSE](../LICENSE) | MIT license text |
| [development.md](development.md) | Add sites and blocks, import demo content, and run checks |
| [content-model.md](content-model.md) | Document scope, links, blocks, previews, caching, and browser integrations |
| [deployment.md](deployment.md) | Deploy the web app, Studio, and invalidation Function, and configure CI |
| [documentation.md](documentation.md) | This inventory |

## Prose in other files

| Location | Contents |
| --- | --- |
| [Web environment example](../apps/web/.env.example), [Studio environment example](../apps/studio/.env.example), [Blueprint environment example](../apps/blueprint/.env.example) | Configuration requirements and defaults |
| [`apps/studio/schema/`](../apps/studio/schema/), [`packages/blocks/src/blocks/`](../packages/blocks/src/blocks/), [`schema-fields.ts`](../packages/blocks/src/lib/schema-fields.ts), [`sanity-rich-text.ts`](../packages/blocks/src/lib/sanity-rich-text.ts) | Field help, labels, validation messages, and previews |
| `*.stories.tsx` in [`packages/blocks/`](../packages/blocks/) and [`packages/ui/`](../packages/ui/) | Component examples shown in Storybook |
| [`turbo/generators/`](../turbo/generators/) | Generator prompts and starter text copied into new files |
| [`packages/internationalization/messages/`](../packages/internationalization/messages/), [`apps/web/src/app/`](../apps/web/src/app/), [`block-labels.tsx`](../packages/blocks/src/components/block-labels.tsx) | Interface messages and accessibility labels |
| [`apps/studio/seed/`](../apps/studio/seed/), [`seed-documents.ts`](../apps/studio/lib/seed-documents.ts) | Demo labels, source attribution, and imported text |
| `markdown.ts` in each [block directory](../packages/blocks/src/blocks/), [`portable-text-to-markdown.ts`](../packages/blocks/src/lib/portable-text-to-markdown.ts) | Generated Markdown text and formatting |
| [`package.json`](../package.json), [`turbo.json`](../turbo.json), [`pnpm-workspace.yaml`](../pnpm-workspace.yaml), [CI](../.github/workflows/ci.yml), [`tooling/`](../tooling/) | Package and task descriptions, configuration comments, and workflow instructions |
| TypeScript, TSX, CSS, and test files under [`apps/`](../apps/) and [`packages/`](../packages/) | API comments, implementation notes, test descriptions, and sample strings |

`schema.json` and `sanity.types.ts` are generated from source. The seed NDJSON contains attributed Wikipedia excerpts and Met records. Those excerpts, artwork titles, and license text retain their source wording. Names such as `ShowcaseGrid`, API identifiers, and paths retain their spelling.

## Refresh the file list

List documentation files, including hidden paths, with:

```sh
rg --files --hidden -g '!.git' -g '*.md' -g '*.mdx' -g '*.rst' -g '*.adoc' -g '*.txt' -g '*LICENSE*' -g '*NOTICE*' -g '*.env.example'
```

List tracked files, including prose embedded in code, with:

```sh
git ls-files
```
