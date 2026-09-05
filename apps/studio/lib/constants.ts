import { ComposeIcon } from "@sanity/icons/Compose";
import { InsertAboveIcon } from "@sanity/icons/InsertAbove";
import { SearchIcon } from "@sanity/icons/Search";
import type { FieldGroupDefinition } from "sanity";

export { SANITY_API_VERSION as API_VERSION } from "@repo/blocks/lib/sanity-api-version";

export const GROUP = {
  MAIN_CONTENT: "main-content",
  OG: "og",
  SEO: "seo",
};

export const GROUPS: FieldGroupDefinition[] = [
  {
    default: true,
    icon: ComposeIcon,
    name: GROUP.MAIN_CONTENT,
    title: "Content",
  },
  { icon: SearchIcon, name: GROUP.SEO, title: "SEO" },
  {
    icon: InsertAboveIcon,
    name: GROUP.OG,
    title: "Open Graph",
  },
];

/**
 * Document types the document-internationalization plugin manages. Navigation
 * and footer are localized too, but as singletons: the Structure opens one
 * fixed document per language, so the plugin's "create translation", which
 * makes a new document under a random ID the site would never read, must not
 * apply to them.
 */
export const TRANSLATED_TYPES = ["page", "faq"] as const;

/** Document types that belong to exactly one site (they carry a `site` key). */
export const SITE_SCOPED_TYPES = [
  "page",
  "navigation",
  "footer",
  "settings",
  "redirect",
] as const;

/** Document types that use field-level localization (internationalized arrays). */
export const FIELD_LEVEL_TYPES = ["settings"] as const;
