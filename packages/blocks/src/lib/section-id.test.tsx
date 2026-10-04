import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CTABlock } from "../blocks/cta/cta";
import { FaqAccordion } from "../blocks/faq-accordion/faq-accordion";
import { FeatureCardsWithIcon } from "../blocks/feature-cards-icon/feature-cards-icon";
import { HeroBlock } from "../blocks/hero/hero";
import { LogoCloud } from "../blocks/logo-cloud/logo-cloud";
import { ShowcaseGrid } from "../blocks/showcase-grid/showcase-grid";
import { SocialGrid } from "../blocks/social-grid/social-grid";
import { SubscribeNewsletter } from "../blocks/subscribe-newsletter/subscribe-newsletter";
import { VideoFeature } from "../blocks/video-feature/video-feature";
import { placeholderImage } from "../testing/fixtures";
import { sectionId, sectionRepeatKeys } from "./section-id";

describe(sectionId, () => {
  test("keeps the bare id without a repeat key", () =>
    expect(sectionId("faq")).toBe("faq"));

  test("appends the repeat key", () =>
    expect(sectionId("faq", "a1b2c3")).toBe("faq-a1b2c3"));
});

const always = () => true;

describe(sectionRepeatKeys, () => {
  test("keys only the blocks whose type is already higher on the page", () =>
    expect(
      sectionRepeatKeys(
        [
          { _key: "f1", _type: "faqAccordion" },
          { _key: "c1", _type: "cta" },
          { _key: "f2", _type: "faqAccordion" },
          { _key: "c2", _type: "cta" },
          { _key: "f3", _type: "faqAccordion" },
        ],
        always
      )
    ).toStrictEqual([undefined, undefined, "f2", "c2", "f3"]));

  test("follows the order, so the block moved to the top takes the bare id", () =>
    expect(
      sectionRepeatKeys(
        [
          { _key: "f2", _type: "faqAccordion" },
          { _key: "f1", _type: "faqAccordion" },
        ],
        always
      )
    ).toStrictEqual([undefined, "f1"]));

  test("leaves the bare id to the first block that renders a section", () =>
    expect(
      sectionRepeatKeys(
        [
          { _key: "l1", _type: "logoCloud" },
          { _key: "l2", _type: "logoCloud" },
          { _key: "l3", _type: "logoCloud" },
        ],
        ({ _key }) => _key !== "l1"
      )
    ).toStrictEqual([undefined, undefined, "l3"]));
});

// The bare ids are what editors and other sites already link to (`/about#faq`).
// Showcase renders its section in two places: with and without items.
const SECTIONS: [string, string, (repeatKey?: string) => ReactElement][] = [
  ["cta", "cta", (repeatKey) => <CTABlock repeatKey={repeatKey} title="T" />],
  [
    "faq",
    "faq",
    (repeatKey) => <FaqAccordion repeatKey={repeatKey} title="T" />,
  ],
  [
    "features",
    "features",
    (repeatKey) => <FeatureCardsWithIcon repeatKey={repeatKey} title="T" />,
  ],
  [
    "hero",
    "hero",
    (repeatKey) => <HeroBlock repeatKey={repeatKey} title="T" />,
  ],
  [
    "logo-cloud",
    "logo-cloud",
    (repeatKey) => (
      <LogoCloud
        logos={[{ _key: "l1", image: placeholderImage(1) }]}
        repeatKey={repeatKey}
      />
    ),
  ],
  [
    "showcase without items",
    "showcase",
    (repeatKey) => <ShowcaseGrid repeatKey={repeatKey} title="T" />,
  ],
  [
    "showcase with items",
    "showcase",
    (repeatKey) => (
      <ShowcaseGrid
        items={[{ _key: "i1", siteName: "Site" }]}
        repeatKey={repeatKey}
        title="T"
      />
    ),
  ],
  [
    "socials",
    "socials",
    (repeatKey) => (
      <SocialGrid
        repeatKey={repeatKey}
        socials={[{ _key: "s1", href: "https://github.com", label: "GitHub" }]}
      />
    ),
  ],
  [
    "subscribe",
    "subscribe",
    (repeatKey) => <SubscribeNewsletter repeatKey={repeatKey} title="T" />,
  ],
  [
    "video-feature",
    "video-feature",
    (repeatKey) => <VideoFeature repeatKey={repeatKey} title="T" />,
  ],
];

describe("page-builder section ids", () => {
  test.each(SECTIONS)("the first %s block keeps its id", (_name, id, render) =>
    expect(renderToStaticMarkup(render())).toContain(` id="${id}"`)
  );

  test.each(SECTIONS)(
    "a repeated %s block appends its key",
    (_name, id, render) => {
      const html = renderToStaticMarkup(render("k2"));

      expect(html).toContain(` id="${id}-k2"`);
      expect(html).not.toContain(` id="${id}"`);
    }
  );
});
