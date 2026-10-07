import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { PageBuilderBlock } from "@/types";

import { PageBlocks, renderPageBlocks } from "./page-blocks";

type BlockData = Pick<PageBuilderBlock, "_key" | "_type"> &
  Record<string, unknown>;

const render = (blocks: BlockData[]) =>
  renderToStaticMarkup(
    <PageBlocks
      blocks={renderPageBlocks({
        blocks: blocks as PageBuilderBlock[],
        editable: false,
        id: "page-1",
        type: "page",
      })}
    />
  );

const ids = (html: string) =>
  [...html.matchAll(/ id="(?<id>[^"]+)"/gu)].map((match) => match.groups?.id);

const LOGOS = [
  {
    _key: "l1",
    image: { alt: "Acme", id: "image-abc123-200x80-png" },
  },
];

const SOCIALS = [{ _key: "s1", href: "https://github.com", label: "GitHub" }];

// The least content each type needs to render its section.
const SECTIONS: [string, PageBuilderBlock["_type"], object][] = [
  ["cta", "cta", {}],
  ["faq", "faqAccordion", {}],
  ["features", "featureCardsIcon", {}],
  ["hero", "hero", {}],
  ["logo-cloud", "logoCloud", { logos: LOGOS }],
  ["showcase", "showcaseGrid", {}],
  ["socials", "socialGrid", { socials: SOCIALS }],
  ["subscribe", "subscribeNewsletter", {}],
  ["video-feature", "videoFeature", {}],
];

describe(renderPageBlocks, () => {
  it.each(SECTIONS)("a repeated %s block appends its key", (id, _type, data) =>
    expect(
      ids(
        render([
          { _key: "a", _type, ...data },
          { _key: "b", _type, ...data },
        ])
      )
    ).toStrictEqual([id, `${id}-b`])
  );

  it("keys repeats per type, wherever they are on the page", () =>
    expect(
      ids(
        render([
          { _key: "h1", _type: "hero" },
          { _key: "f1", _type: "faqAccordion" },
          { _key: "h2", _type: "hero" },
          { _key: "f2", _type: "faqAccordion" },
        ])
      )
    ).toStrictEqual(["hero", "faq", "hero-h2", "faq-f2"]));

  it.each([
    ["logo-cloud", "logoCloud", { logos: [] }, { logos: LOGOS }],
    ["socials", "socialGrid", { socials: null }, { socials: SOCIALS }],
  ] as const)(
    "an empty %s block leaves the bare id to the populated one below",
    (id, _type, empty, populated) =>
      expect(
        ids(
          render([
            { _key: "a", _type, ...empty },
            { _key: "b", _type, ...populated },
          ])
        )
      ).toStrictEqual([id])
  );
});
