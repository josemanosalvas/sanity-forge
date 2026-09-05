import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { FaqAccordion } from "./faq-accordion";

describe(FaqAccordion, () => {
  test("FaqAccordion renders questions and optional link", () => {
    const html = renderToStaticMarkup(
      <FaqAccordion
        title="FAQs"
        link={{
          href: "https://example.com",
          title: "All questions",
        }}
        categories={[
          {
            _key: "cat-1",
            faqs: [
              {
                _id: "faq-1",
                title: "How do I import schemas?",
              },
            ],
            title: "General",
          },
        ]}
      />
    );

    expect(html).toMatch(/FAQs/u);
    expect(html).toMatch(/How do I import schemas\?/u);
    expect(html).toMatch(/All questions/u);
  });

  test("FaqAccordion renders subtitle and faq trigger titles", () => {
    const html = renderToStaticMarkup(
      <FaqAccordion
        subtitle="Helpful answers"
        categories={[
          {
            _key: "cat-1",
            faqs: [
              {
                _id: "faq-2",
                richText: [
                  {
                    _key: "block-1",
                    _type: "block",
                    children: [
                      { _type: "span", text: "Inside the shared package." },
                    ],
                  },
                ],
                title: "Where do the answers render?",
              },
            ],
            title: "General",
          },
        ]}
      />
    );

    expect(html).toMatch(/Helpful answers/u);
    expect(html).toMatch(/Where do the answers render\?/u);
  });

  const twoCategories = renderToStaticMarkup(
    <FaqAccordion
      title="FAQs"
      categories={[
        {
          _key: "cat-1",
          faqs: [{ _id: "faq-1", title: "First question" }],
          title: "First Category",
        },
        {
          _key: "cat-2",
          faqs: [{ _id: "faq-2", title: "Second question" }],
          title: "Second Category",
        },
      ]}
    />
  );

  test("FaqAccordion lists every category tab with the first one active", () => {
    expect(twoCategories).toMatch(/First Category/u);
    expect(twoCategories).toMatch(/Second Category/u);
    expect(twoCategories).toMatch(/aria-pressed="true"/u);
    expect(twoCategories).toMatch(/aria-pressed="false"/u);
  });

  test("FaqAccordion shows only the first category's questions", () => {
    // Exclude the inert measurement layer when asserting visible content.
    const [visible] = twoCategories.split('inert=""');
    expect(visible).toMatch(/First question/u);
    expect(visible).not.toMatch(/Second question/u);
  });

  test("FaqAccordion renders with no categories", () => {
    const html = renderToStaticMarkup(<FaqAccordion title="No items yet" />);

    expect(html).toMatch(/No items yet/u);
  });
});
