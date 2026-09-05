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

import { Logo } from "./components/logo";
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

/**
 * One workspace per site: the workspace switcher makes the current site
 * explicit, the structure only lists that site's content, translations are
 * limited to the locales the site serves, and Presentation opens the site's
 * own origin. All workspaces share the dataset, so shared content (FAQs,
 * media) is available everywhere.
 */
const createWorkspace = (site: Site): WorkspaceOptions => {
  const languages = languageOptions(site.locales);

  return {
    name: site.key,
    title: `${env.SANITY_STUDIO_TITLE} · ${site.name}`,
    subtitle: site.domains.production,
    basePath: `/${site.key}`,
    icon: Logo,
    projectId,
    dataset,
    releases: {
      enabled: true,
    },
    plugins: [
      presentationTool(createPresentationConfig(site)),
      structureTool({
        structure: createStructure(site),
      }),
      documentInternationalization({
        supportedLanguages: languages,
        schemaTypes: [...TRANSLATED_TYPES],
        languageField: "language",
        apiVersion: API_VERSION,
        // The Structure ships its own site-aware templates.
        addTemplates: false,
      }),
      internationalizedArray({
        apiVersion: API_VERSION,
        languages,
        defaultLanguages: [site.locales[0]],
        fieldTypes: ["string", "text"],
        languageDisplay: "titleAndCode",
        restoreOrder: false,
        languageFilter: {
          documentTypes: [...FIELD_LEVEL_TYPES],
          defaultLanguages: [site.locales[0]],
        },
      }),
      visionTool({ defaultApiVersion: API_VERSION }),
      lucideIconPicker(),
      media(),
      muxInput(),
      assist(),
    ],
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
    schema: {
      types: schemaTypes,
      templates: createTemplates,
    },
  };
};

export default defineConfig(siteList.map(createWorkspace));
