/** Slugs are public paths without a locale prefix. */

import { locales } from "@repo/internationalization/locales";
import { getPublishedId } from "sanity";
import type { SlugIsUniqueValidator } from "sanity";
import slugify from "slugify";

import { API_VERSION } from "./constants";

interface SlugValidationResult {
  errors: string[];
  warnings: string[];
}

export interface SlugValidationOptions {
  /** Human-readable doc type name for error messages */
  documentType?: string;
  /** Allow the bare `/` slug (the home page) */
  allowRoot?: boolean;
  customValidators?: ((slug: string) => string[])[];
}

const SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const MIN_LEN = 3;
const MAX_LEN = 60;

const RESERVED_PREFIXES = [
  ["/api", "API routes"],
  ["/_next", "Next.js internals"],
  ["/sitemap", "sitemap routes"],
  ["/robots", "robots routes"],
  ["/monitoring", "the error reporting endpoint"],
  ["/sitemap.xml", "the sitemap"],
  ["/robots.txt", "robots"],
] as const;

const SLUG_ERROR_MESSAGES = {
  CONSECUTIVE_HYPHENS: "Use only one hyphen between words.",
  INVALID_CHARACTERS:
    "Only lowercase letters, numbers, and hyphens are allowed.",
  INVALID_START_END: "Slug can't start or end with a hyphen.",
  MISSING_LEADING_SLASH: "URL path must start with a forward slash (/)",
  MULTIPLE_SLASHES: "Multiple consecutive slashes (//) are not allowed.",
  NO_SPACES: "No spaces. Use hyphens instead.",
  NO_UNDERSCORES: "Underscores aren't allowed. Use hyphens instead.",
  REQUIRED: "Slug must have a value",
  TRAILING_SLASH: "URL path must not end with a forward slash (/)",
} as const;

const SLUG_WARNING_MESSAGES = {
  TOO_LONG: `Slug can't be longer than ${MAX_LEN} characters.`,
  TOO_SHORT: `Slug must be at least ${MIN_LEN} characters long.`,
} as const;

const CONFIGS: Record<string, SlugValidationOptions> = {
  page: {
    allowRoot: true,
    customValidators: [
      (slug) =>
        RESERVED_PREFIXES.filter(
          ([prefix]) => slug === prefix || slug.startsWith(`${prefix}/`)
        ).map(
          ([prefix, label]) =>
            `Pages cannot use the "${prefix}" prefix - reserved for ${label}`
        ),
      (slug) => {
        const [, first = ""] = slug.split("/");
        return (locales as readonly string[]).includes(first)
          ? [
              `"/${first}" is a language prefix. Pages get their language from the Language field, so leave it out of the slug.`,
            ]
          : [];
      },
    ],
    documentType: "Page",
  },
};

const validateSegment = (seg: string): SlugValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (seg.includes(" ")) {
    errors.push(SLUG_ERROR_MESSAGES.NO_SPACES);
  }
  if (seg.includes("_")) {
    errors.push(SLUG_ERROR_MESSAGES.NO_UNDERSCORES);
  }
  if (seg.startsWith("-") || seg.endsWith("-")) {
    errors.push(SLUG_ERROR_MESSAGES.INVALID_START_END);
  }
  if (seg.includes("--")) {
    errors.push(SLUG_ERROR_MESSAGES.CONSECUTIVE_HYPHENS);
  }
  if (!SEGMENT_RE.test(seg) && errors.length === 0) {
    errors.push(SLUG_ERROR_MESSAGES.INVALID_CHARACTERS);
  }

  if (seg.length < MIN_LEN) {
    warnings.push(SLUG_WARNING_MESSAGES.TOO_SHORT);
  }
  if (seg.length > MAX_LEN) {
    warnings.push(SLUG_WARNING_MESSAGES.TOO_LONG);
  }

  return { errors, warnings };
};

const validatePathStructure = (slug: string): string[] => {
  const errors: string[] = [];

  if (!slug.startsWith("/")) {
    errors.push(SLUG_ERROR_MESSAGES.MISSING_LEADING_SLASH);
  }
  if (slug.length > 1 && slug.endsWith("/")) {
    errors.push(SLUG_ERROR_MESSAGES.TRAILING_SLASH);
  }
  if (slug.includes("//")) {
    errors.push(SLUG_ERROR_MESSAGES.MULTIPLE_SLASHES);
  }

  return errors;
};

const validateSlug = (
  slug: string | undefined | null,
  options: SlugValidationOptions = {}
): SlugValidationResult => {
  if (!slug?.trim()) {
    return { errors: [SLUG_ERROR_MESSAGES.REQUIRED], warnings: [] };
  }

  if (slug === "/") {
    return options.allowRoot
      ? { errors: [], warnings: [] }
      : {
          errors: [`${options.documentType ?? "Document"} slugs cannot be "/"`],
          warnings: [],
        };
  }

  const segments = slug.split("/").filter(Boolean);
  const errors: string[] = [...validatePathStructure(slug)];
  const warnings: string[] = [];

  for (const validator of options.customValidators ?? []) {
    errors.push(...validator(slug));
  }

  for (const seg of segments) {
    const r = validateSegment(seg);
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }

  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
};

export const getDocumentTypeConfig = (
  docType: string
): SlugValidationOptions =>
  CONFIGS[docType] ? { ...CONFIGS[docType] } : { documentType: "Document" };

export const createSlugErrorValidator =
  (
    options: SlugValidationOptions
  ): ((slug: { current?: string } | undefined) => string | true) =>
  (slug) => {
    const { errors } = validateSlug(slug?.current, options);
    return errors.length > 0 ? errors.join("; ") : true;
  };

/** Scope uniqueness to a site and language, excluding all versions of this document. */
export const isUniqueSlug: SlugIsUniqueValidator = (slug, context) => {
  const { document, getClient } = context;
  if (!slug || !document?._id) {
    return true;
  }
  return getClient({ apiVersion: API_VERSION }).fetch<boolean>(
    `!defined(*[_type == $type && site == $site && language == $language && slug.current == $slug && !sanity::versionOf($published)][0]._id)`,
    {
      language: document.language ?? null,
      published: getPublishedId(document._id),
      site: document.site ?? null,
      slug,
      type: document._type,
    },
    { perspective: "raw" }
  );
};

export const createSlugWarningValidator =
  (
    options: SlugValidationOptions
  ): ((slug: { current?: string } | undefined) => string | true) =>
  (slug) => {
    const { warnings } = validateSlug(slug?.current, options);
    return warnings.length > 0 ? warnings.join("; ") : true;
  };

/** Generate a slug from a document title, keeping any parent path of the current slug. */
export const generateSlugFromTitle = (
  title: string,
  currentSlug?: string
): string => {
  if (!title?.trim()) {
    return "";
  }

  const clean = slugify(title, { lower: true, strict: true });
  if (!clean) {
    return "";
  }

  if (currentSlug?.includes("/")) {
    const segments = currentSlug.split("/").filter(Boolean);
    if (segments.length > 1) {
      return `/${segments.slice(0, -1).join("/")}/${clean}`;
    }
  }
  return `/${clean}`;
};
