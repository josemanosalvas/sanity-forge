import { getSite } from "@repo/internationalization/sites";
import type { SettingsQueryResult } from "@repo/sanity/types";
import type { Metadata } from "next";
import { describe, expect, test } from "vitest";

import type { PageDocument, SiteContext } from "@/types";

import { pageMetadata, siteMetadata } from "./seo";

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

  test("the format is negotiated instead of pinned to jpg", () => {
    const url = ogUrl(
      pageMetadata(context, page({ ogImage: ogImage() }), settings())
    );
    expect(url).toContain("auto=format");
    expect(url).not.toContain("fm=jpg");
  });

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
  });
});
