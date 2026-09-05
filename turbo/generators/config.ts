import { execSync } from "node:child_process";

import type { PlopTypes } from "@turbo/gen";

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

const toPascalCase = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const toCamelCase = (value: string) => {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const toTitleCase = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const validateName = (value: string) =>
  KEBAB_CASE.test(value) ||
  "Use kebab-case: lowercase letters, digits and hyphens";

const install = () => {
  execSync("pnpm install", { stdio: "inherit" });
  return "Dependencies installed";
};

const format = (paths: string) => {
  execSync(`pnpm exec oxfmt ${paths}`, { stdio: "inherit" });
  return "Files formatted";
};

const generator = (plop: PlopTypes.NodePlopAPI): void => {
  plop.setHelper("eq", (a: unknown, b: unknown) => a === b);
  plop.setHelper("pascalCase", toPascalCase);
  plop.setHelper("camelCase", toCamelCase);
  plop.setHelper("titleCase", toTitleCase);

  plop.setGenerator("package", {
    actions: [
      {
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/package/package.json.hbs",
        type: "add",
      },
      {
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/package/tsconfig.json.hbs",
        type: "add",
      },
      // A concrete first module rather than an `index.ts` that would grow into
      // a barrel; consumers import `@repo/{{ name }}/{{ name }}`.
      {
        path: "packages/{{ name }}/src/{{ name }}.ts",
        templateFile: "templates/package/module.ts.hbs",
        type: "add",
      },
      install,
      (answers) =>
        format(`packages/${String((answers as { name: string }).name)}`),
    ],
    description: "Scaffold a new @repo/* workspace package",
    prompts: [
      {
        message: "Package name (without the @repo/ prefix)",
        name: "name",
        type: "input",
        validate: validateName,
      },
      {
        choices: [
          { name: "React components (react-library preset)", value: "react" },
          { name: "Node/TypeScript code (node preset)", value: "node" },
        ],
        default: "react",
        message: "What does the package contain?",
        name: "kind",
        type: "list",
      },
    ],
  });

  plop.setGenerator("block", {
    actions: [
      {
        path: "packages/blocks/src/blocks/{{ name }}/schema.ts",
        templateFile: "templates/block/schema.ts.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/blocks/{{ name }}/query.ts",
        templateFile: "templates/block/query.ts.hbs",
        type: "add",
      },
      // The renderer is named after its folder so the `./*` export pattern
      // resolves `@repo/blocks/<name>` to it.
      {
        path: "packages/blocks/src/blocks/{{ name }}/{{ name }}.tsx",
        templateFile: "templates/block/block.tsx.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/blocks/{{ name }}/{{ name }}.stories.tsx",
        templateFile: "templates/block/block.stories.tsx.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/blocks/{{ name }}/markdown.ts",
        templateFile: "templates/block/markdown.ts.hbs",
        type: "add",
      },
      // Register the block in the schema list, the projection and the Markdown
      // dispatcher; the wildcard package exports already cover the new files.
      {
        path: "packages/blocks/src/schemas.ts",
        pattern: /(?<anchor>export const blockSchemas = \[)/u,
        template: "$<anchor>\n  {{ camelCase name }}Schema,",
        type: "modify",
      },
      {
        path: "packages/blocks/src/schemas.ts",
        pattern:
          /(?<anchor>import \{ ctaSchema \} from "\.\/blocks\/cta\/schema";)/u,
        template:
          'import { {{ camelCase name }}Schema } from "./blocks/{{ name }}/schema";\n$<anchor>',
        type: "modify",
      },
      {
        path: "packages/blocks/src/queries.ts",
        pattern:
          /(?<anchor>import \{ ctaGroqProjection \} from "\.\/blocks\/cta\/query";)/u,
        template:
          'import { {{ camelCase name }}GroqProjection } from "./blocks/{{ name }}/query";\n$<anchor>',
        type: "modify",
      },
      {
        path: "packages/blocks/src/queries.ts",
        pattern: /(?<anchor>\$\{videoFeatureGroqProjection\})/u,
        // oxlint-disable-next-line no-template-curly-in-string -- emits a literal `${}` GROQ interpolation
        template: "$<anchor>,\n    ${ {{ camelCase name }}GroqProjection}",
        type: "modify",
      },
      {
        path: "packages/blocks/src/lib/page-builder-to-markdown.ts",
        pattern:
          /(?<anchor>import \{ ctaToMarkdown \} from "\.\.\/blocks\/cta\/markdown";)/u,
        template:
          'import { {{ camelCase name }}ToMarkdown } from "../blocks/{{ name }}/markdown";\n$<anchor>',
        type: "modify",
      },
      {
        path: "packages/blocks/src/lib/page-builder-to-markdown.ts",
        pattern: /(?<anchor>\n {4}default: \{)/u,
        template:
          '\n    case "{{ camelCase name }}": {\n      return {{ camelCase name }}ToMarkdown(block, options);\n    }$<anchor>',
        type: "modify",
      },
      (answers) =>
        format(
          `packages/blocks/src/blocks/${String((answers as { name: string }).name)} packages/blocks/src`
        ),
      () =>
        "Block scaffolded. Next: add a dynamic import and a `case` for it in apps/web/src/components/page-builder.tsx, run `pnpm typegen`, and add tests for the block's behavior.",
    ],
    description: "Scaffold a new page-builder block in packages/blocks",
    prompts: [
      {
        message: "Block name in kebab-case (e.g. testimonial-carousel)",
        name: "name",
        type: "input",
        validate: validateName,
      },
      {
        default: "A new page-builder section",
        message: "One-line description shown to editors",
        name: "description",
        type: "input",
      },
    ],
  });
};

export default generator;
