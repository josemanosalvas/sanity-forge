import { describe, expect, test } from "vitest";

import { strings } from "../seed/manifest.ts";
import {
  duplicateKeyPaths,
  images,
  internalLinks,
  plainText,
  references,
} from "./seed-checks.ts";
import type { SeedDocumentLike } from "./seed-checks.ts";
import {
  buildSeedDocuments,
  metaDescription,
  workAlt,
} from "./seed-documents.ts";
import type {
  MetWork,
  SeedSiteInput,
  WikipediaText,
} from "./seed-documents.ts";

const work = (
  objectID: number,
  title: string,
  artist = "Vincent van Gogh"
): MetWork => ({
  artistDisplayName: artist,
  creditLine: "Purchase, 1993",
  medium: "Oil on canvas",
  objectDate: "1889",
  objectID,
  objectURL: `https://www.metmuseum.org/art/collection/search/${objectID}`,
  primaryImageSmall: `https://images.metmuseum.org/${objectID}.jpg`,
  title,
});

const text = (title: string, ...paragraphs: string[]): WikipediaText => ({
  paragraphs,
  title,
  url: `https://en.wikipedia.org/wiki/${title.replaceAll(" ", "_")}`,
});

const site: SeedSiteInput = {
  home: {
    texts: {
      de: text("Post-Impressionismus", "Erster Absatz.", "Zweiter Absatz."),
      en: text("Post-Impressionism", "First paragraph.", "Second paragraph."),
    },
    works: [
      work(1, "Wheat Field with Cypresses"),
      work(2, "The Dance Class", "Edgar Degas"),
    ],
  },
  inner: {
    key: "vincent-van-gogh",
    slugs: { de: "/vincent-van-gogh-de", en: "/vincent-van-gogh" },
    texts: {
      de: text("Vincent van Gogh", "Absatz eins.", "Absatz zwei."),
      en: text("Vincent van Gogh", "Paragraph one.", "Paragraph two."),
    },
    works: [
      work(3, "Self-Portrait with a Straw Hat"),
      work(1, "Wheat Field with Cypresses"),
    ],
  },
  locales: ["en", "de"],
  site: "brand-a",
};

const build = (input: SeedSiteInput = site): SeedDocumentLike[] =>
  buildSeedDocuments({
    openAccessUrl: "https://www.metmuseum.org/open-access",
    sites: [input],
    strings,
  });

const scoped = (document: SeedDocumentLike) => ({
  language: document.language as string | undefined,
  site: document.site as string | undefined,
});

describe(buildSeedDocuments, () => {
  test("creates the singletons under the IDs the site reads, scoped to their site and language", () => {
    const documents = build();
    const byId = new Map(documents.map((document) => [document._id, document]));
    const scopes = [
      "settings-brand-a",
      "navigation-brand-a-en",
      "navigation-brand-a-de",
      "footer-brand-a-en",
      "footer-brand-a-de",
    ].map((id) => [id, scoped(byId.get(id) ?? { _id: id, _type: "missing" })]);
    expect(scopes).toStrictEqual([
      ["settings-brand-a", { language: undefined, site: "brand-a" }],
      ["navigation-brand-a-en", { language: "en", site: "brand-a" }],
      ["navigation-brand-a-de", { language: "de", site: "brand-a" }],
      ["footer-brand-a-en", { language: "en", site: "brand-a" }],
      ["footer-brand-a-de", { language: "de", site: "brand-a" }],
    ]);
  });

  test("links each page to its translations with weak references keyed by language", () => {
    const documents = build();
    const byId = new Map(documents.map((document) => [document._id, document]));
    const metadata = documents.filter(
      (document) => document._type === "translation.metadata"
    );
    const links = metadata.flatMap((entry) =>
      (
        entry.translations as {
          _key: string;
          value: { _ref: string; _weak?: boolean };
        }[]
      ).map((translation) => ({
        key: translation._key,
        language: byId.get(translation.value._ref)?.language,
        weak: translation.value._weak,
      }))
    );
    expect(metadata.map((entry) => entry._id)).toStrictEqual([
      "translation-metadata-brand-a-home",
      "translation-metadata-brand-a-vincent-van-gogh",
    ]);
    expect(links).toStrictEqual([
      { key: "en", language: "en", weak: true },
      { key: "de", language: "de", weak: true },
      { key: "en", language: "en", weak: true },
      { key: "de", language: "de", weak: true },
    ]);
  });

  test("uses the root slug for home pages and the localized slug for inner pages", () => {
    const slugs = build()
      .filter((document) => document._type === "page")
      .map((page) => [page._id, (page.slug as { current: string }).current]);
    expect(slugs).toStrictEqual([
      ["page-brand-a-en-home", "/"],
      ["page-brand-a-en-vincent-van-gogh", "/vincent-van-gogh"],
      ["page-brand-a-de-home", "/"],
      ["page-brand-a-de-vincent-van-gogh-de", "/vincent-van-gogh-de"],
    ]);
  });

  test("every reference resolves and every internal link targets a page of the linking document's site and language", () => {
    const documents = build();
    const byId = new Map(documents.map((document) => [document._id, document]));
    const unresolved = documents.flatMap((document) =>
      references(document).filter((found) => !byId.has(found.ref))
    );
    const links = documents.flatMap((document) =>
      internalLinks(document).map((link) => ({
        from: `${document._id} ${link.path}`,
        matches: (() => {
          const target = byId.get(link.ref);
          return (
            target?._type === "page" &&
            target.site === document.site &&
            target.language === document.language
          );
        })(),
      }))
    );
    expect(unresolved).toStrictEqual([]);
    expect(links.length).toBeGreaterThan(0);
    expect(links.filter((link) => !link.matches)).toStrictEqual([]);
  });

  test("images that the schema requires alt text for carry a non-empty one, and array keys are unique", () => {
    const documents = build();
    const found = documents.flatMap(images);
    const missingAlt = found.filter(
      (image) =>
        image.requiresAlt &&
        !(typeof image.alt === "string" && image.alt.trim() !== "")
    );
    expect(found.filter((image) => image.requiresAlt).length).toBeGreaterThan(
      0
    );
    expect(missingAlt).toStrictEqual([]);
    expect(
      found.every((image) => image.source.startsWith("image@https://"))
    ).toBeTruthy();
    expect(documents.flatMap(duplicateKeyPaths)).toStrictEqual([]);
  });

  test("credits Wikipedia on every page and links the licence from every footer", () => {
    const documents = build();
    const uncredited = documents
      .filter((document) => document._type === "page")
      .filter((page) => !plainText(page).includes("CC BY-SA 4.0"));
    const footersWithoutLicence = documents
      .filter((document) => document._type === "footer")
      .filter(
        (footer) =>
          !JSON.stringify(footer).includes(
            "https://creativecommons.org/licenses/by-sa/4.0/"
          )
      );
    expect(uncredited).toStrictEqual([]);
    expect(footersWithoutLicence).toStrictEqual([]);
  });

  test("refuses a locale the site does not serve, and a language without a slug", () => {
    expect(() =>
      build({ ...site, locales: ["en", "fr"], site: "brand-b" })
    ).toThrow("brand-b does not serve fr");
    expect(() =>
      build({ ...site, inner: { ...site.inner, slugs: { en: "/x" } } })
    ).toThrow("Missing vincent-van-gogh slug for de");
  });
});

describe(metaDescription, () => {
  test("keeps short text and cuts long text at a sentence or word boundary", () => {
    expect(metaDescription("Short.")).toBe("Short.");
    const sentence = "A sentence that ends here. ";
    expect(metaDescription(sentence.repeat(8))).toBe(sentence.repeat(5).trim());
    expect(metaDescription("word ".repeat(40))).toMatch(
      /^(?:word ){31}word…$/u
    );
  });
});

describe(workAlt, () => {
  test("drops empty parts", () => {
    expect(workAlt(work(9, "Scenes from the Tale of Genji", ""))).toBe(
      "Scenes from the Tale of Genji, 1889"
    );
  });
});
