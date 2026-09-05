import { evaluate, parse } from "groq-js";
import { describe, expect, test } from "vitest";

import { richTextFragment, urlFragment } from "./groq-fragments";

const pages = [
  {
    _id: "home-a",
    _type: "page",
    language: "en",
    site: "brand-a",
    slug: { current: "/" },
  },
  {
    _id: "preise-a",
    _type: "page",
    language: "de",
    site: "brand-a",
    slug: { current: "/preise" },
  },
  {
    _id: "pricing-b",
    _type: "page",
    language: "en",
    site: "brand-b",
    slug: { current: "/pricing" },
  },
];

const internal = (key: string, ref: string) => ({
  _key: key,
  url: { internal: { _ref: ref }, type: "internal" },
});

/** A shared FAQ: links authored once, rendered on whichever site shows it. */
const dataset = [
  ...pages,
  {
    _id: "faq",
    _type: "faq",
    links: [
      internal("same-site", "preise-a"),
      internal("home", "home-a"),
      internal("other-site", "pricing-b"),
      internal("gone", "deleted"),
      { _key: "address", url: { external: "/about", type: "external" } },
    ],
    richText: [
      {
        _key: "p",
        _type: "block",
        children: [{ _key: "s", _type: "span", marks: ["m"], text: "pricing" }],
        markDefs: [
          {
            _key: "m",
            _type: "customLink",
            customLink: { internal: { _ref: "pricing-b" }, type: "internal" },
          },
        ],
      },
    ],
  },
];

const run = async (query: string, site: string) => {
  const value = await evaluate(parse(query), {
    dataset,
    params: { defaultLocale: "en", site },
  });
  return value.get();
};

const hrefs = async (site: string) => {
  const links = (await run(
    `*[_id == "faq"][0].links[]{ _key, ${urlFragment} }`,
    site
  )) as { _key: string; href: string | null }[];
  return Object.fromEntries(links.map((link) => [link._key, link.href]));
};

describe("localizedInternalHref", () => {
  test("keeps internal links on the site that renders them", async () => {
    await expect(hrefs("brand-a")).resolves.toStrictEqual({
      address: "/about",
      gone: null,
      home: "/",
      "other-site": null,
      "same-site": "/de/preise",
    });
  });

  test("resolves the same reference on its own site", async () => {
    await expect(hrefs("brand-b")).resolves.toMatchObject({
      "other-site": "/pricing",
      "same-site": null,
    });
  });

  test("applies to rich text links too", async () => {
    const doc = (await run(
      `*[_id == "faq"][0]{ ${richTextFragment} }`,
      "brand-a"
    )) as { richText: { markDefs: { href: string | null }[] }[] };
    expect(doc.richText[0]?.markDefs[0]?.href).toBeNull();
  });
});
