import { getSite } from "@repo/internationalization/sites";
import { pageMetadataQuery, pageQuery } from "@repo/sanity/queries";
import type { SettingsQueryResult } from "@repo/sanity/types";
import { evaluate, parse } from "groq-js";
import type { Metadata } from "next";
import { describe, expect, test } from "vitest";

import type { PageDocument, SiteContext } from "@/types";

import { pageMetadata, siteMetadata, siteTranslations } from "./seo";

const context: SiteContext = {
  defaultLocale: "en",
  locale: "en",
  site: getSite("brand-a"),
};

/** 1600×900, so a 1200×630 card has to cut something away vertically. */
const ASSET_ID = "image-a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1600x900-jpg";

type OgImage = NonNullable<PageDocument["ogImage"]>;

const ogImage = (fields: Partial<OgImage> = {}): OgImage => ({
  alt: null,
  crop: null,
  hotspot: null,
  id: ASSET_ID,
  preview: null,
  ...fields,
});

const page = (fields: Partial<PageDocument> = {}): PageDocument => ({
  _id: "page-about",
  _type: "page",
  description: null,
  language: "en",
  ogDescription: null,
  ogImage: null,
  ogTitle: null,
  seoDescription: null,
  seoNoIndex: null,
  seoTitle: null,
  site: "brand-a",
  slug: "/about",
  title: "About",
  translations: null,
  ...fields,
});

const settings = (
  fields: Partial<NonNullable<SettingsQueryResult>> = {}
): SettingsQueryResult => ({
  _id: "settings-brand-a",
  _type: "settings",
  contactEmail: null,
  favicon: null,
  logos: null,
  ogImage: null,
  site: "brand-a",
  siteDescription: null,
  siteTitle: "Brand A",
  socialLinks: null,
  ...fields,
});

const withTwitter = (twitter: string | null): SettingsQueryResult =>
  settings({
    socialLinks: {
      facebook: null,
      instagram: null,
      linkedin: null,
      reddit: null,
      twitter,
      youtube: null,
    },
  });

/** `openGraph.images` accepts several shapes; this module always writes the descriptor. */
const ogUrl = (metadata: Metadata) =>
  (metadata.openGraph?.images as { url: string }[] | undefined)?.[0]?.url;

describe(pageMetadata, () => {
  test("the hotspot moves the card's crop off centre", () => {
    const centred = ogUrl(
      pageMetadata(context, page({ ogImage: ogImage() }), settings())
    );
    const low = ogUrl(
      pageMetadata(
        context,
        page({ ogImage: ogImage({ hotspot: { x: 0.5, y: 0.8 } }) }),
        settings()
      )
    );
    expect(centred).toContain("rect=0,30,1600,840");
    expect(low).toContain("rect=0,60,1600,840");
    expect(low).toContain("w=1200");
    expect(low).toContain("h=630");
  });

  test("the editor's crop bounds the card before it is sized", () => {
    const url = ogUrl(
      pageMetadata(
        context,
        page({
          ogImage: ogImage({
            crop: { bottom: 0, left: 0, right: 0, top: 0.25 },
          }),
        }),
        settings()
      )
    );
    expect(url).toContain("rect=157,225,1286,675");
  });

  test.each(["jpg", "webp", "avif"])(
    "social images use JPEG for a %s source",
    (format) => {
      const url = ogUrl(
        pageMetadata(
          context,
          page({
            ogImage: ogImage({
              id: ASSET_ID.replace(/jpg$/u, format),
            }),
          }),
          settings()
        )
      );
      expect(url).toContain("fm=jpg");
    }
  );

  test("the site default fills in, alt text included, for a page with no image", () => {
    const metadata = pageMetadata(
      context,
      page(),
      settings({ ogImage: ogImage({ alt: "The Brand A office" }) })
    );
    expect(metadata.openGraph?.images).toStrictEqual([
      {
        alt: "The Brand A office",
        height: 630,
        url: expect.stringContaining("rect=0,30,1600,840"),
        width: 1200,
      },
    ]);
  });

  test("an unusable asset ref degrades to the summary card, never a throw", () => {
    const metadata = pageMetadata(
      context,
      page({ ogImage: ogImage({ id: "image-not-a-real-ref" }) }),
      settings()
    );
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter).toMatchObject({ card: "summary" });
  });

  test.each([null, "image-not-a-real-ref"])(
    "an unusable page asset (%s) falls back to the site image and its alt text",
    (id) => {
      const metadata = pageMetadata(
        context,
        page({ ogImage: ogImage({ alt: "Broken page image", id }) }),
        settings({ ogImage: ogImage({ alt: "Site image" }) })
      );
      expect(metadata.openGraph?.images).toStrictEqual([
        {
          alt: "Site image",
          height: 630,
          url: expect.stringContaining("fm=jpg"),
          width: 1200,
        },
      ]);
      expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    }
  );

  test.each([
    ["https://x.com/acme", "@acme"],
    ["https://x.com/acme/", "@acme"],
    ["https://x.com/acme?lang=en", "@acme"],
    ["https://twitter.com/@acme", "@acme"],
    ["@acme", "@acme"],
    ["acme", "@acme"],
    ["  @acme  ", "@acme"],
    ["https://x.com/", undefined],
    ["x.com/acme", undefined],
    ["", undefined],
    [null, undefined],
  ])("twitter:creator reads %s as %s", (twitter, expected) => {
    const metadata = pageMetadata(context, page(), withTwitter(twitter));
    expect(metadata.twitter?.creator).toBe(expected);
  });
});

describe(siteMetadata, () => {
  test("the site default image is cropped around its own hotspot", () => {
    const metadata = siteMetadata(
      context,
      settings({ ogImage: ogImage({ hotspot: { x: 0.5, y: 0.8 } }) })
    );
    expect(ogUrl(metadata)).toContain("rect=0,60,1600,840");
    expect(ogUrl(metadata)).toContain("fm=jpg");
  });
});

describe.each([
  { name: "page", query: pageQuery },
  { name: "page metadata", query: pageMetadataQuery },
])("$name image projection", ({ query }) => {
  const mainImage = { alt: "Main image", asset: { _ref: ASSET_ID } };
  const asset = {
    _id: ASSET_ID,
    _type: "sanity.imageAsset",
    url: "https://cdn.sanity.io/images/test/production/main.jpg",
  };
  const project = async (fields: Record<string, unknown>) => {
    const result = await evaluate(parse(query), {
      dataset: [
        {
          ...page(),
          image: mainImage,
          slug: { current: "/about" },
          ...fields,
        },
        asset,
      ],
      params: {
        defaultLocale: "en",
        locale: "en",
        path: "/about",
        site: "brand-a",
      },
    });
    return result.get();
  };

  test.each([
    { name: "framing without an asset", seoImage: { crop: { top: 0.25 } } },
    { name: "empty asset", seoImage: { asset: {} } },
    {
      name: "deleted asset",
      seoImage: { asset: { _ref: "image-deleted-1600x900-jpg" } },
    },
  ])("$name falls back to the main image", async ({ seoImage }) => {
    const result = await project({ seoImage });
    expect(result.ogImage).toMatchObject({ alt: "Main image", id: ASSET_ID });
  });

  test("a resolved override preserves its framing and takes priority", async () => {
    const crop = { bottom: 0, left: 0, right: 0, top: 0.25 };
    const hotspot = { x: 0.3, y: 0.7 };
    const result = await project({
      seoImage: { alt: "Override", asset: { _ref: ASSET_ID }, crop, hotspot },
    });
    expect(result.ogImage).toMatchObject({
      alt: "Override",
      crop,
      hotspot,
      id: ASSET_ID,
    });
  });

  test("unresolved page assets leave the site image available", async () => {
    const result = await project({
      image: { asset: { _ref: "image-deleted-1600x900-jpg" } },
      seoImage: { asset: {} },
    });
    expect(result.ogImage).toBeNull();
    const metadata = pageMetadata(
      context,
      result,
      settings({ ogImage: ogImage() })
    );
    expect(ogUrl(metadata)).toContain("fm=jpg");
  });
});

describe(siteTranslations, () => {
  test("keeps only this site's translations in the locales it serves", () =>
    expect(
      siteTranslations(
        [
          { language: "de", site: "brand-b", slug: "/preise" },
          { language: "de", site: "brand-a", slug: "/preise" },
          { language: "fr", site: "brand-b", slug: "/tarifs" },
          { language: "en", site: "brand-b", slug: null },
        ],
        "brand-b"
      )
    ).toStrictEqual([{ locale: "de", path: "/preise" }]));
});
