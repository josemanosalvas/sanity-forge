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
      {
        path: "packages/{{ name }}/src/index.ts",
        templateFile: "templates/package/index.ts.hbs",
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
        path: "packages/blocks/src/{{ name }}/schema.ts",
        templateFile: "templates/block/schema.ts.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/{{ name }}/query.ts",
        templateFile: "templates/block/query.ts.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/{{ name }}/component.tsx",
        templateFile: "templates/block/component.tsx.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/{{ name }}/component.test.tsx",
        templateFile: "templates/block/component.test.tsx.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/{{ name }}/component.stories.tsx",
        templateFile: "templates/block/component.stories.tsx.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/{{ name }}/markdown.ts",
        templateFile: "templates/block/markdown.ts.hbs",
        type: "add",
      },
      {
        path: "packages/blocks/src/{{ name }}/markdown.test.ts",
        templateFile: "templates/block/markdown.test.ts.hbs",
        type: "add",
      },
      // Register the block in the schema list, the projection, the renderer
      // barrel and the Markdown dispatcher.
      {
        path: "packages/blocks/src/schemas.ts",
        pattern: /(?<anchor>export const blockSchemas = \[)/u,
        template: "$<anchor>\n  {{ camelCase name }}Schema,",
        type: "modify",
      },
      {
        path: "packages/blocks/src/schemas.ts",
        pattern: /(?<anchor>export \{ ctaSchema \} from "\.\/cta\/schema";)/u,
        template:
          'export { {{ camelCase name }}Schema } from "./{{ name }}/schema";\n$<anchor>',
        type: "modify",
      },
      {
        path: "packages/blocks/src/schemas.ts",
        pattern: /(?<anchor>import \{ ctaSchema \} from "\.\/cta\/schema";)/u,
        template:
          'import { {{ camelCase name }}Schema } from "./{{ name }}/schema";\n$<anchor>',
        type: "modify",
      },
      {
        path: "packages/blocks/src/queries.ts",
        pattern:
          /(?<anchor>import \{ ctaGroqProjection \} from "\.\/cta\/query";)/u,
        template:
          'import { {{ camelCase name }}GroqProjection } from "./{{ name }}/query";\n$<anchor>',
        type: "modify",
      },
      {
        path: "packages/blocks/src/queries.ts",
        pattern:
          /(?<anchor>export \{ ctaGroqProjection \} from "\.\/cta\/query";)/u,
        template:
          'export { {{ camelCase name }}GroqProjection } from "./{{ name }}/query";\n$<anchor>',
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
        path: "packages/blocks/src/components.ts",
        pattern: /(?<anchor>export \{ CTABlock \} from "\.\/cta\/component";)/u,
        template:
          'export { {{ pascalCase name }} } from "./{{ name }}/component";\n$<anchor>',
        type: "modify",
      },
      {
        path: "packages/blocks/src/internal/page-builder-to-markdown.ts",
        pattern:
          /(?<anchor>import \{ ctaToMarkdown \} from "\.\.\/cta\/markdown";)/u,
        template:
          'import { {{ camelCase name }}ToMarkdown } from "../{{ name }}/markdown";\n$<anchor>',
        type: "modify",
      },
      {
        path: "packages/blocks/src/internal/page-builder-to-markdown.ts",
        pattern: /(?<anchor>\n {4}default: \{)/u,
        template:
          '\n    case "{{ camelCase name }}": {\n      return {{ camelCase name }}ToMarkdown(block, options);\n    }$<anchor>',
        type: "modify",
      },
      (answers) =>
        format(
          `packages/blocks/src/${String((answers as { name: string }).name)} packages/blocks/src`
        ),
      () =>
        "Block scaffolded. Next: add a `case` for it in apps/web/src/components/page-builder.tsx, then run `pnpm typegen`.",
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
