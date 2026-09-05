import { ComposeIcon } from "@sanity/icons/Compose";
import { InsertAboveIcon } from "@sanity/icons/InsertAbove";
import { SearchIcon } from "@sanity/icons/Search";
import type { FieldGroupDefinition } from "sanity";

export const API_VERSION = "2026-09-01";

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

/** Document types that are localized per document via @sanity/document-internationalization. */
export const TRANSLATED_TYPES = [
  "page",
  "navigation",
  "footer",
  "faq",
] as const;

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
