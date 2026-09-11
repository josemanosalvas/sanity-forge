import {
  localizedSingletonId,
  settingsDocumentId,
} from "@repo/blocks/lib/singletons";
import type { Locale } from "@repo/internationalization/locales";
import { getSite, siteSupportsLocale } from "@repo/internationalization/sites";
import type { SiteKey } from "@repo/internationalization/sites";

/** A public-domain artwork from The Met's collection API. */
export interface MetWork {
  objectID: number;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium: string;
  creditLine: string;
  primaryImageSmall: string;
  objectURL: string;
}

/** The introduction of one Wikipedia article, one paragraph per entry. */
export interface WikipediaText {
  title: string;
  url: string;
  paragraphs: readonly string[];
}

/** The few labels the sites need that no open dataset provides. */
export interface Strings {
  home: string;
  collection: string;
  worksAtTheMet: string;
  worksBy: (artist: string) => string;
  openAccessTitle: string;
  openAccessText: string;
  openAccessPolicy: string;
  sources: string;
  imageCredit: string;
  textCredit: string;
  wikipedia: string;
  copyright: string;
  attribution: (title: string) => string;
}

export interface SeedSiteInput {
  site: SiteKey;
  locales: readonly Locale[];
  home: {
    texts: Partial<Record<Locale, WikipediaText>>;
    /** The first work is the hero image and the featured showcase item. */
    works: readonly MetWork[];
  };
  inner: {
    slug: string;
    texts: Partial<Record<Locale, WikipediaText>>;
    works: readonly MetWork[];
  };
}

export interface SeedInput {
  sites: readonly SeedSiteInput[];
  strings: Record<Locale, Strings>;
  openAccessUrl: string;
}

export type SeedDocument = { _id: string; _type: string } & Record<
  string,
  unknown
>;

const MET_COLLECTION_URL = "https://www.metmuseum.org/art/collection";
const CC_BY_SA_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
const META_DESCRIPTION_LENGTH = 160;

const externalUrl = (external: string, openInNewTab = true) => ({
  _type: "customUrl",
  external,
  openInNewTab,
  type: "external",
});

const internalUrl = (ref: string) => ({
  _type: "customUrl",
  internal: { _ref: ref, _type: "reference" },
  openInNewTab: false,
  type: "internal",
});

const paragraph = (key: string, text: string) => ({
  _key: key,
  _type: "block",
  children: [{ _key: `${key}-0`, _type: "span", marks: [], text }],
  markDefs: [],
  style: "normal",
});

/** The import CLI uploads `_sanityAsset` URLs and replaces them with asset references. */
const asset = (work: MetWork) => `image@${work.primaryImageSmall}`;

export const workAlt = (work: MetWork): string =>
  [work.title, work.artistDisplayName, work.objectDate]
    .filter((part) => part.trim() !== "")
    .join(", ");

const workCaption = (work: MetWork): string => {
  const author = work.artistDisplayName.trim();
  return `${work.title} (${work.objectDate})${author ? `, ${author}` : ""}. ${work.creditLine}`;
};

const imageWithAlt = (work: MetWork) => ({
  _sanityAsset: asset(work),
  _type: "image",
  alt: workAlt(work),
});

const plainImage = (work: MetWork) => ({
  _sanityAsset: asset(work),
  _type: "image",
});

/** The first sentence of a paragraph, or its head at a word boundary when the sentence runs long. */
export const metaDescription = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.length <= META_DESCRIPTION_LENGTH) {
    return trimmed;
  }
  const window = trimmed.slice(0, META_DESCRIPTION_LENGTH);
  const sentenceEnd = window.lastIndexOf(". ");
  if (sentenceEnd > META_DESCRIPTION_LENGTH / 2) {
    return window.slice(0, sentenceEnd + 1);
  }
  return `${window.slice(0, window.lastIndexOf(" "))}…`;
};

const pageId = (site: SiteKey, locale: Locale, slug: string) =>
  slug === "/"
    ? `page-${site}-${locale}-home`
    : `page-${site}-${locale}${slug.replaceAll("/", "-")}`;

const button = (
  key: string,
  text: string,
  variant: "default" | "outline",
  url: ReturnType<typeof externalUrl> | ReturnType<typeof internalUrl>
) => ({ _key: key, _type: "button", text, url, variant });

const showcaseGrid = (title: string, works: readonly MetWork[]) => ({
  _key: "works",
  _type: "showcaseGrid",
  items: works.map((work, index) => ({
    _key: `work-${work.objectID}`,
    _type: "showcaseItem",
    category: work.artistDisplayName.trim() || work.medium,
    featured: index === 0,
    screenshot: imageWithAlt(work),
    siteName: work.title,
    url: work.objectURL,
  })),
  title,
});

const textWith = (
  text: WikipediaText,
  attribution: string,
  inlineImage?: MetWork
) => {
  const blocks: Record<string, unknown>[] = text.paragraphs.map((body, index) =>
    paragraph(`p-${index}`, body)
  );
  if (inlineImage) {
    blocks.splice(1, 0, {
      ...imageWithAlt(inlineImage),
      _key: `image-${inlineImage.objectID}`,
      caption: workCaption(inlineImage),
    });
  }
  return [...blocks, paragraph("attribution", attribution)];
};

const hero = (
  text: WikipediaText,
  work: MetWork,
  buttons: ReturnType<typeof button>[]
) => ({
  _key: "hero",
  _type: "hero",
  buttons,
  richText: [paragraph("hero-text", metaDescription(text.paragraphs[0] ?? ""))],
  title: text.title,
  video: { light: { mediaType: "sanity", poster: plainImage(work) } },
});

const requireText = (
  texts: Partial<Record<Locale, WikipediaText>>,
  locale: Locale,
  what: string
): WikipediaText => {
  const text = texts[locale];
  if (!text) {
    throw new Error(`Missing ${what} text for ${locale}`);
  }
  return text;
};

const requireWork = (works: readonly MetWork[], what: string): MetWork => {
  const [work] = works;
  if (!work) {
    throw new Error(`Missing ${what} works`);
  }
  return work;
};

const siteDocuments = (
  input: SeedSiteInput,
  strings: Record<Locale, Strings>,
  openAccessUrl: string
): SeedDocument[] => {
  const { site, locales, home, inner } = input;
  const siteName = getSite(site).name;
  const homeWork = requireWork(home.works, "home");
  const innerWork = requireWork(inner.works, inner.slug);
  const documents: SeedDocument[] = [];

  for (const locale of locales) {
    if (!siteSupportsLocale(site, locale)) {
      throw new Error(`${site} does not serve ${locale}`);
    }
    const s = strings[locale];
    const homeText = requireText(home.texts, locale, "home");
    const innerText = requireText(inner.texts, locale, inner.slug);
    const homeId = pageId(site, locale, "/");
    const innerId = pageId(site, locale, inner.slug);

    documents.push(
      {
        _id: homeId,
        _type: "page",
        description: metaDescription(homeText.paragraphs[0] ?? ""),
        image: imageWithAlt(homeWork),
        language: locale,
        pageBuilder: [
          hero(homeText, homeWork, [
            button("inner", innerText.title, "default", internalUrl(innerId)),
            button(
              "collection",
              s.collection,
              "outline",
              externalUrl(MET_COLLECTION_URL)
            ),
          ]),
          showcaseGrid(s.worksAtTheMet, home.works),
          {
            _key: "about",
            _type: "richTextBlock",
            eyebrow: s.wikipedia,
            richText: textWith(homeText, s.attribution(homeText.title)),
            title: homeText.title,
          },
          {
            _key: "open-access",
            _type: "cta",
            buttons: [
              button(
                "policy",
                s.openAccessPolicy,
                "default",
                externalUrl(openAccessUrl)
              ),
            ],
            richText: [paragraph("open-access-text", s.openAccessText)],
            title: s.openAccessTitle,
          },
        ],
        site,
        slug: { _type: "slug", current: "/" },
        title: homeText.title,
      },
      {
        _id: innerId,
        _type: "page",
        description: metaDescription(innerText.paragraphs[0] ?? ""),
        image: imageWithAlt(innerWork),
        language: locale,
        pageBuilder: [
          hero(innerText, innerWork, [
            button(
              "collection",
              s.collection,
              "outline",
              externalUrl(MET_COLLECTION_URL)
            ),
          ]),
          {
            _key: "about",
            _type: "richTextBlock",
            eyebrow: s.wikipedia,
            richText: textWith(
              innerText,
              s.attribution(innerText.title),
              inner.works[1]
            ),
            title: innerText.title,
          },
          showcaseGrid(
            s.worksBy(innerWork.artistDisplayName || innerText.title),
            inner.works
          ),
        ],
        site,
        slug: { _type: "slug", current: inner.slug },
        title: innerText.title,
      },
      {
        _id: localizedSingletonId("navigation", site, locale),
        _type: "navigation",
        buttons: [
          button(
            "open-access",
            s.openAccessPolicy,
            "outline",
            externalUrl(openAccessUrl)
          ),
        ],
        columns: [
          {
            _key: "home",
            _type: "navigationLink",
            name: s.home,
            url: internalUrl(homeId),
          },
          {
            _key: "inner",
            _type: "navigationLink",
            name: innerText.title,
            url: internalUrl(innerId),
          },
          {
            _key: "collection",
            _type: "navigationLink",
            name: s.collection,
            url: externalUrl(MET_COLLECTION_URL),
          },
        ],
        language: locale,
        site,
      },
      {
        _id: localizedSingletonId("footer", site, locale),
        _type: "footer",
        columns: [
          {
            _key: "sources",
            _type: "footerColumn",
            links: [
              {
                _key: "home-article",
                _type: "footerColumnLink",
                name: `${homeText.title} – ${s.wikipedia}`,
                url: externalUrl(homeText.url),
              },
              {
                _key: "inner-article",
                _type: "footerColumnLink",
                name: `${innerText.title} – ${s.wikipedia}`,
                url: externalUrl(innerText.url),
              },
              {
                _key: "images",
                _type: "footerColumnLink",
                name: s.imageCredit,
                url: externalUrl(openAccessUrl),
              },
              {
                _key: "text",
                _type: "footerColumnLink",
                name: s.textCredit,
                url: externalUrl(CC_BY_SA_URL),
              },
            ],
            title: s.sources,
          },
        ],
        copyright: s.copyright,
        language: locale,
        site,
      }
    );
  }

  const localized = <T>(value: (locale: Locale) => T) =>
    locales.map((locale) => ({
      _key: locale,
      language: locale,
      ...value(locale),
    }));

  documents.push({
    _id: settingsDocumentId(site),
    _type: "settings",
    ogImage: plainImage(homeWork),
    site,
    siteDescription: localized((locale) => ({
      _type: "internationalizedArrayTextValue",
      value: metaDescription(
        requireText(home.texts, locale, "home").paragraphs[0] ?? ""
      ),
    })),
    siteTitle: localized(() => ({
      _type: "internationalizedArrayStringValue",
      value: siteName,
    })),
  });

  for (const slug of ["/", inner.slug]) {
    documents.push({
      _id: `translation-metadata-${pageId(site, "en", slug).slice("page-".length).replace(`-en-`, "-")}`,
      _type: "translation.metadata",
      schemaTypes: ["page"],
      translations: localized((locale) => ({
        _type: "internationalizedArrayReferenceValue",
        value: {
          _ref: pageId(site, locale, slug),
          _type: "reference",
          _weak: true,
        },
      })),
    });
  }

  return documents;
};

export const buildSeedDocuments = ({
  sites,
  strings,
  openAccessUrl,
}: SeedInput): SeedDocument[] =>
  sites.flatMap((site) => siteDocuments(site, strings, openAccessUrl));

export const toNdjson = (documents: readonly SeedDocument[]): string =>
  `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`;
