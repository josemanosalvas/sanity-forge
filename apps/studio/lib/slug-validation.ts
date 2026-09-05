/**
 * Slug validation, the single source of truth for URL path rules. Slugs are
 * public paths without a locale prefix (`/about`, `/pricing/teams`); the
 * locale prefix is added by the web app at render time.
 */

import { locales } from "@repo/internationalization/locales";
import type { ValidationContext } from "sanity";
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
  /** Custom validators returning error strings */
  customValidators?: ((slug: string) => string[])[];
}

const SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LEN = 3;
const MAX_LEN = 60;

const RESERVED_PREFIXES = [
  ["/api", "API routes"],
  ["/_next", "Next.js internals"],
  ["/sitemap.xml", "the sitemap"],
  ["/robots.txt", "robots"],
] as const;

const SLUG_ERROR_MESSAGES = {
  REQUIRED: "Slug must have a value",
  INVALID_CHARACTERS:
    "Only lowercase letters, numbers, and hyphens are allowed.",
  INVALID_START_END: "Slug can't start or end with a hyphen.",
  CONSECUTIVE_HYPHENS: "Use only one hyphen between words.",
  NO_SPACES: "No spaces. Use hyphens instead.",
  NO_UNDERSCORES: "Underscores aren't allowed. Use hyphens instead.",
  MULTIPLE_SLASHES: "Multiple consecutive slashes (//) are not allowed.",
  MISSING_LEADING_SLASH: "URL path must start with a forward slash (/)",
  TRAILING_SLASH: "URL path must not end with a forward slash (/)",
} as const;

const SLUG_WARNING_MESSAGES = {
  TOO_SHORT: `Slug must be at least ${MIN_LEN} characters long.`,
  TOO_LONG: `Slug can't be longer than ${MAX_LEN} characters.`,
} as const;

const CONFIGS: Record<string, SlugValidationOptions> = {
  page: {
    documentType: "Page",
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
  },
};

function validateSegment(seg: string): SlugValidationResult {
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
}

function validatePathStructure(slug: string): string[] {
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
}

function validateSlug(
  slug: string | undefined | null,
  options: SlugValidationOptions = {}
): SlugValidationResult {
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
}

export function getDocumentTypeConfig(docType: string): SlugValidationOptions {
  return CONFIGS[docType]
    ? { ...CONFIGS[docType] }
    : { documentType: "Document" };
}

export function createSlugErrorValidator(
  options: SlugValidationOptions
): (slug: { current?: string } | undefined) => string | true {
  return (slug) => {
    const { errors } = validateSlug(slug?.current, options);
    return errors.length > 0 ? errors.join("; ") : true;
  };
}

/**
 * Reject a slug already used by another document of the same site and
 * language. The document's own draft and published ids are excluded so
 * re-saving an unchanged document doesn't flag itself.
 */
export function createSlugUniqueValidator(): (
  slug: { current?: string } | undefined,
  context: ValidationContext
) => Promise<string | true> {
  return async (slug, context) => {
    const current = slug?.current;
    if (!(current && context.getClient)) {
      return true;
    }
    const document = context.document as
      | { _id?: string; _type?: string; site?: string; language?: string }
      | undefined;
    const id = (document?._id ?? "").replace(/^drafts\./, "");
    const taken = await context
      .getClient({ apiVersion: API_VERSION })
      .fetch<number>(
        `count(*[_type == $type && site == $site && language == $language && slug.current == $slug && !(_id in [$draft, $published])])`,
        {
          type: document?._type,
          site: document?.site ?? null,
          language: document?.language ?? null,
          slug: current,
          draft: `drafts.${id}`,
          published: id,
        }
      );
    return taken > 0
      ? `“${current}” is already used by another document on this site in this language. URLs must be unique.`
      : true;
  };
}

export function createSlugWarningValidator(
  options: SlugValidationOptions
): (slug: { current?: string } | undefined) => string | true {
  return (slug) => {
    const { warnings } = validateSlug(slug?.current, options);
    return warnings.length > 0 ? warnings.join("; ") : true;
  };
}

function cleanSlug(slug: string): string {
  if (!slug) {
    return "";
  }
  return slugify(slug, { lower: true, strict: true });
}

/** Generate a slug from a document title, keeping any parent path of the current slug. */
export function generateSlugFromTitle(
  title: string,
  currentSlug?: string
): string {
  if (!title?.trim()) {
    return "";
  }

  const clean = cleanSlug(title);
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
}
