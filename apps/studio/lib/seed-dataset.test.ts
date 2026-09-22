/// <reference types="node" />
import { readFileSync } from "node:fs";

import { locales } from "@repo/internationalization/locales";
import {
  isSiteKey,
  siteSupportsLocale,
} from "@repo/internationalization/sites";
import { describe, expect, test } from "vitest";

import { MET_OPEN_ACCESS_URL, sources } from "../seed/manifest.ts";
import {
  duplicateKeyPaths,
  images,
  internalLinks,
  parseNdjson,
  plainText,
  references,
} from "./seed-checks.ts";
import type { SeedDocumentLike } from "./seed-checks.ts";
import { expectedSingletonId } from "./singletons.ts";

/** The file `pnpm seed` imports, checked as committed. */
const documents = parseNdjson(
  readFileSync(new URL("../seed/dataset.ndjson", import.meta.url), "utf-8")
);
const byId = new Map(documents.map((document) => [document._id, document]));

const page = (site: string, language: string, slug: string) =>
  documents.find(
    (document) =>
      document._type === "page" &&
      document.site === site &&
      document.language === language &&
      (document.slug as { current?: string } | undefined)?.current === slug
  );

const showcaseObjectIds = (document: SeedDocumentLike | undefined) =>
  (
    (document?.pageBuilder ?? []) as {
      _type: string;
      items?: { url: string }[];
    }[]
  )
    .filter((block) => block._type === "showcaseGrid")
    .flatMap((block) =>
      (block.items ?? []).map((item) => Number(item.url.split("/").at(-1)))
    );

describe("the committed seed dataset", () => {
  test("has one document per ID and every reference resolves inside the file", () => {
    expect(new Set(documents.map((document) => document._id)).size).toBe(
      documents.length
    );
    const unresolved = documents.flatMap((document) =>
      references(document)
        .filter((found) => !byId.has(found.ref))
        .map((found) => `${document._id} ${found.path}`)
    );
    expect(unresolved).toStrictEqual([]);
    expect(documents.flatMap(duplicateKeyPaths)).toStrictEqual([]);
  });

  test("seeds settings, navigation, footer and both pages for every site and language in the manifest", () => {
    const missing = sources.flatMap((source) => [
      ...(byId.has(`settings-${source.site}`)
        ? []
        : [`settings-${source.site}`]),
      ...source.locales.flatMap((locale) =>
        [
          expectedSingletonId("navigation", {
            language: locale,
            site: source.site,
          }),
          expectedSingletonId("footer", {
            language: locale,
            site: source.site,
          }),
        ].filter((id): id is string => id !== undefined && !byId.has(id))
      ),
      ...source.locales.flatMap((locale) =>
        [
          ["/", page(source.site, locale, "/")],
          [
            source.inner.slugs[locale],
            page(source.site, locale, source.inner.slugs[locale] ?? ""),
          ],
        ]
          .filter(([, found]) => found === undefined)
          .map(([slug]) => `${source.site} ${locale} ${String(slug)}`)
      ),
    ]);
    expect(missing).toStrictEqual([]);
    const scopeMismatches = documents
      .filter((document) =>
        ["navigation", "footer", "settings"].includes(document._type)
      )
      .filter(
        (document) =>
          expectedSingletonId(
            document._type as "navigation" | "footer" | "settings",
            { language: document.language, site: document.site }
          ) !== document._id
      )
      .map((document) => document._id);
    expect(scopeMismatches).toStrictEqual([]);
  });

  test("pages belong to a language their site serves, with a slug their site can route", () => {
    const pages = documents.filter((document) => document._type === "page");
    const violations = pages.flatMap((document) => {
      const slug =
        (document.slug as { current?: string } | undefined)?.current ?? "";
      const [, first = ""] = slug.split("/");
      const problems = [
        isSiteKey(document.site) &&
        siteSupportsLocale(document.site, document.language)
          ? []
          : ["language"],
        slug.startsWith("/") && (slug === "/" || !slug.endsWith("/"))
          ? []
          : ["slug"],
        (locales as readonly string[]).includes(first) ? ["locale prefix"] : [],
        typeof document.title === "string" && document.title !== ""
          ? []
          : ["title"],
        typeof document.description === "string" &&
        document.description.length <= 160
          ? []
          : ["description"],
      ].flat();
      return problems.map((problem) => `${document._id}: ${problem}`);
    });
    expect(pages).toHaveLength(10);
    expect(violations).toStrictEqual([]);
  });

  test("translation metadata joins each page to its translations of the same site and content", () => {
    const problems = sources.flatMap((source) =>
      (
        [
          [
            "home",
            Object.fromEntries(source.locales.map((locale) => [locale, "/"])),
          ],
          [source.inner.key, source.inner.slugs],
        ] as const
      ).flatMap(([key, slugs]) => {
        const metadata = byId.get(`translation-metadata-${source.site}-${key}`);
        const translations = (metadata?.translations ?? []) as {
          _key: string;
          value: { _ref: string };
        }[];
        const expected = source.locales.map(
          (locale) => page(source.site, locale, slugs[locale] ?? "")?._id
        );
        const actual = translations.map((translation) =>
          translation._key === byId.get(translation.value._ref)?.language
            ? translation.value._ref
            : `wrong key ${translation._key}`
        );
        return JSON.stringify(actual) === JSON.stringify(expected)
          ? []
          : [
              `${source.site} ${key}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`,
            ];
      })
    );
    expect(problems).toStrictEqual([]);
    const referencedPages = documents
      .filter((document) => document._type === "translation.metadata")
      .flatMap((entry) => references(entry).map((found) => found.ref))
      .toSorted();
    const pageIds = documents
      .filter((document) => document._type === "page")
      .map((document) => document._id)
      .toSorted();
    expect(referencedPages).toStrictEqual(pageIds);
  });

  test("internal links stay on the linking document's site and language", () => {
    const links = documents.flatMap((document) =>
      internalLinks(document).map((link) => {
        const target = byId.get(link.ref);
        const ok =
          target?._type === "page" &&
          target.site === document.site &&
          target.language === document.language;
        return ok ? null : `${document._id} ${link.path} -> ${link.ref}`;
      })
    );
    expect(links.length).toBeGreaterThan(0);
    expect(links.filter((link) => link !== null)).toStrictEqual([]);
  });

  test("every image is a Met Open Access file, alt text is present where the schema requires it, and the showcases follow the manifest", () => {
    const found = documents.flatMap(images);
    expect(
      found.filter(
        (image) =>
          !image.source.startsWith("image@https://images.metmuseum.org/")
      )
    ).toStrictEqual([]);
    expect(
      found.filter(
        (image) =>
          image.requiresAlt &&
          !(typeof image.alt === "string" && image.alt.trim() !== "")
      )
    ).toStrictEqual([]);
    const showcases = sources.flatMap((source) =>
      source.locales.flatMap((locale) => [
        [
          showcaseObjectIds(page(source.site, locale, "/")),
          [...source.home.works],
        ],
        [
          showcaseObjectIds(
            page(source.site, locale, source.inner.slugs[locale] ?? "")
          ),
          [...source.inner.works],
        ],
      ])
    );
    expect(
      showcases.filter(
        ([actual, expected]) =>
          JSON.stringify(actual) !== JSON.stringify(expected)
      )
    ).toStrictEqual([]);
  });

  test("credits Wikipedia on every page and links both licences from every footer", () => {
    const uncredited = documents
      .filter((document) => document._type === "page")
      .filter((document) => !plainText(document).includes("CC BY-SA 4.0"))
      .map((document) => document._id);
    const footers = documents
      .filter((document) => document._type === "footer")
      .filter((footer) => {
        const json = JSON.stringify(footer);
        return !(
          json.includes("https://creativecommons.org/licenses/by-sa/4.0/") &&
          json.includes(MET_OPEN_ACCESS_URL) &&
          json.includes("wikipedia.org/wiki/")
        );
      })
      .map((footer) => footer._id);
    expect(uncredited).toStrictEqual([]);
    expect(footers).toStrictEqual([]);
  });
});
