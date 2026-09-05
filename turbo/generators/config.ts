import { execSync } from "node:child_process";

import type { PlopTypes } from "@turbo/gen";

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setHelper("eq", (a: unknown, b: unknown) => a === b);
  plop.setHelper("pascalCase", toPascalCase);
  plop.setHelper("camelCase", toCamelCase);
  plop.setHelper("titleCase", toTitleCase);

  plop.setGenerator("package", {
    description: "Scaffold a new @repo/* workspace package",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Package name (without the @repo/ prefix)",
        validate: validateName,
      },
      {
        type: "list",
        name: "kind",
        message: "What does the package contain?",
        choices: [
          { name: "React components (react-library preset)", value: "react" },
          { name: "Node/TypeScript code (node preset)", value: "node" },
        ],
        default: "react",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/package/package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/package/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        templateFile: "templates/package/index.ts.hbs",
      },
      install,
      (answers) =>
        format(`packages/${String((answers as { name: string }).name)}`),
    ],
  });

  plop.setGenerator("block", {
    description: "Scaffold a new page-builder block in packages/blocks",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Block name in kebab-case (e.g. testimonial-carousel)",
        validate: validateName,
      },
      {
        type: "input",
        name: "description",
        message: "One-line description shown to editors",
        default: "A new page-builder section",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/blocks/src/{{ name }}/schema.ts",
        templateFile: "templates/block/schema.ts.hbs",
      },
      {
        type: "add",
        path: "packages/blocks/src/{{ name }}/query.ts",
        templateFile: "templates/block/query.ts.hbs",
      },
      {
        type: "add",
        path: "packages/blocks/src/{{ name }}/component.tsx",
        templateFile: "templates/block/component.tsx.hbs",
      },
      {
        type: "add",
        path: "packages/blocks/src/{{ name }}/component.test.tsx",
        templateFile: "templates/block/component.test.tsx.hbs",
      },
      {
        type: "add",
        path: "packages/blocks/src/{{ name }}/component.stories.tsx",
        templateFile: "templates/block/component.stories.tsx.hbs",
      },
      {
        type: "add",
        path: "packages/blocks/src/{{ name }}/markdown.ts",
        templateFile: "templates/block/markdown.ts.hbs",
      },
      {
        type: "add",
        path: "packages/blocks/src/{{ name }}/markdown.test.ts",
        templateFile: "templates/block/markdown.test.ts.hbs",
      },
      {
        type: "add",
        path: "packages/blocks/src/{{ name }}/index.ts",
        templateFile: "templates/block/index.ts.hbs",
      },
      // Register the block in the schema list, the projection, the renderer
      // barrel and the Markdown dispatcher.
      {
        type: "modify",
        path: "packages/blocks/src/schemas.ts",
        pattern: /(export const blockSchemas = \[)/,
        template: "$1\n  {{ camelCase name }}Schema,",
      },
      {
        type: "modify",
        path: "packages/blocks/src/schemas.ts",
        pattern: /(export \{ ctaSchema \} from "\.\/cta\/schema";)/,
        template:
          'export { {{ camelCase name }}Schema } from "./{{ name }}/schema";\n$1',
      },
      {
        type: "modify",
        path: "packages/blocks/src/schemas.ts",
        pattern: /(import \{ ctaSchema \} from "\.\/cta\/schema";)/,
        template:
          'import { {{ camelCase name }}Schema } from "./{{ name }}/schema";\n$1',
      },
      {
        type: "modify",
        path: "packages/blocks/src/queries.ts",
        pattern: /(import \{ ctaGroqProjection \} from "\.\/cta\/query";)/,
        template:
          'import { {{ camelCase name }}GroqProjection } from "./{{ name }}/query";\n$1',
      },
      {
        type: "modify",
        path: "packages/blocks/src/queries.ts",
        pattern: /(export \{ ctaGroqProjection \} from "\.\/cta\/query";)/,
        template:
          'export { {{ camelCase name }}GroqProjection } from "./{{ name }}/query";\n$1',
      },
      {
        type: "modify",
        path: "packages/blocks/src/queries.ts",
        pattern: /(\$\{videoFeatureGroqProjection\})/,
        // oxlint-disable-next-line no-template-curly-in-string -- emits a literal `${}` GROQ interpolation
        template: "$1,\n    ${ {{ camelCase name }}GroqProjection}",
      },
      {
        type: "modify",
        path: "packages/blocks/src/components.ts",
        pattern: /(export \{ CTABlock \} from "\.\/cta\/component";)/,
        template:
          'export { {{ pascalCase name }} } from "./{{ name }}/component";\n$1',
      },
      {
        type: "modify",
        path: "packages/blocks/src/internal/page-builder-to-markdown.ts",
        pattern: /(import \{ ctaToMarkdown \} from "\.\.\/cta\/markdown";)/,
        template:
          'import { {{ camelCase name }}ToMarkdown } from "../{{ name }}/markdown";\n$1',
      },
      {
        type: "modify",
        path: "packages/blocks/src/internal/page-builder-to-markdown.ts",
        pattern: /(\n {4}default: \{)/,
        template:
          '\n    case "{{ camelCase name }}": {\n      return {{ camelCase name }}ToMarkdown(block, options);\n    }$1',
      },
      (answers) =>
        format(
          `packages/blocks/src/${String((answers as { name: string }).name)} packages/blocks/src`
        ),
      () =>
        "Block scaffolded. Next: add a `case` for it in apps/web/src/components/page-builder.tsx, a thumbnail.png, then run `pnpm typegen`.",
    ],
  });
}
