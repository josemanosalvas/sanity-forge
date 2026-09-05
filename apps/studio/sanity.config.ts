import { siteList } from "@repo/internationalization/sites";
import type { Site } from "@repo/internationalization/sites";
import { lucideIconPicker } from "@robotostudio/sanity-plugin-lucide-icon-picker";
import { assist } from "@sanity/assist";
import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import type { WorkspaceOptions } from "sanity";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { media } from "sanity-plugin-media";
import { muxInput } from "sanity-plugin-mux-input";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { env } from "./env";
import {
  API_VERSION,
  FIELD_LEVEL_TYPES,
  SITE_SCOPED_TYPES,
  TRANSLATED_TYPES,
} from "./lib/constants";
import { languageOptions } from "./lib/site";
import { createPresentationConfig } from "./presentation";
// Explicit `/index`: Vite resolves a bare `./schema` to the extracted
// `schema.json` next to this file once `sanity schema extract` has run.
import { schemaTypes } from "./schema/index";
import { createStructure } from "./structure";
import { createTemplates } from "./structure/templates";

const projectId = env.SANITY_STUDIO_PROJECT_ID;
const dataset = env.SANITY_STUDIO_DATASET;

// Site-scoped types and plugin-owned types are never created from the global
// "new document" menu; they are reached through the site's structure.
const hiddenFromGlobalCreate = new Set<string>([
  ...SITE_SCOPED_TYPES,
  "faq",
  "translation.metadata",
  "assist.instruction.context",
  "media.tag",
  "mux.videoAsset",
]);

const createWorkspace = (site: Site): WorkspaceOptions => {
  const languages = languageOptions(site.locales);

  return {
    basePath: `/${site.key}`,
    dataset,
    document: {
      newDocumentOptions: (prev, { creationContext }) => {
        if (creationContext.type === "global") {
          return prev.filter(
            (template) =>
              !hiddenFromGlobalCreate.has(template.templateId) &&
              !template.templateId.endsWith("-by-site") &&
              !template.templateId.endsWith("-by-site-language") &&
              !template.templateId.endsWith("-by-language")
          );
        }
        return prev;
      },
    },
    form: {
      components: {
        portableText: {
          plugins: (props) =>
            props.renderDefault({
              ...props,
              plugins: {
                ...props.plugins,
                table: { enabled: true },
              },
            }),
        },
      },
    },
    name: site.key,
    plugins: [
      presentationTool(createPresentationConfig(site)),
      structureTool({
        structure: createStructure(site),
      }),
      documentInternationalization({
        // The Structure ships its own site-aware templates.
        addTemplates: false,
        apiVersion: API_VERSION,
        languageField: "language",
        schemaTypes: [...TRANSLATED_TYPES],
        supportedLanguages: languages,
      }),
      internationalizedArray({
        apiVersion: API_VERSION,
        defaultLanguages: [site.locales[0]],
        fieldTypes: ["string", "text"],
        languageDisplay: "titleAndCode",
        languageFilter: {
          defaultLanguages: [site.locales[0]],
          documentTypes: [...FIELD_LEVEL_TYPES],
        },
        languages,
        restoreOrder: false,
      }),
      visionTool({ defaultApiVersion: API_VERSION }),
      lucideIconPicker(),
      media(),
      muxInput(),
      assist(),
    ],
    projectId,
    releases: {
      enabled: true,
    },
    schema: {
      templates: createTemplates,
      types: schemaTypes,
    },
    subtitle: site.domains.production,
    title: `${env.SANITY_STUDIO_TITLE} · ${site.name}`,
  };
};

export default defineConfig(siteList.map(createWorkspace));
