import { describe, expect, test } from "vitest";

import { faqAccordionToJsonLd } from "./json-ld";

const block = (
  _type: string,
  children: { _type: string; text?: string }[]
) => ({ _type, children });

const span = (text: string) => ({ _type: "span", text });

interface FaqLike {
  title?: string | null;
  richText?: ReturnType<typeof block>[] | null;
}

const category = (faqs: FaqLike[]) => [
  { _key: "cat-1", faqs, title: "General" },
];

describe(faqAccordionToJsonLd, () => {
  interface JsonLdQuestion {
    "@type": string;
    name: unknown;
    acceptedAnswer: unknown;
  }
  interface JsonLdAnswer {
    "@type": string;
    text: unknown;
  }

  const questions = (
    result: ReturnType<typeof faqAccordionToJsonLd>
  ): JsonLdQuestion[] => result?.mainEntity as unknown as JsonLdQuestion[];

  test("returns null for empty or missing faqs", () => {
    expect(faqAccordionToJsonLd({ categories: [] })).toBeNull();
    expect(faqAccordionToJsonLd({})).toBeNull();
    expect(faqAccordionToJsonLd({ categories: null })).toBeNull();
    expect(faqAccordionToJsonLd({ categories: category([]) })).toBeNull();
  });

  test("returns null when no faq has both title and richText", () => {
    expect(
      faqAccordionToJsonLd({
        categories: category([
          { richText: null, title: "Q?" },
          { richText: [block("block", [span("no title")])] },
        ]),
      })
    ).toBeNull();
  });

  const singleFaq = faqAccordionToJsonLd({
    categories: category([
      {
        richText: [block("block", [span("A serialization format.")])],
        title: "What is JSON-LD?",
      },
    ]),
  });

  test("builds a FAQPage with one entity per faq", () => {
    expect(singleFaq).not.toBeNull();
    expect(singleFaq?.["@type"]).toBe("FAQPage");
    expect(questions(singleFaq)).toHaveLength(1);
  });

  test("maps a faq to a Question with an accepted Answer", () => {
    const [question] = questions(singleFaq);
    const answer = question?.acceptedAnswer as JsonLdAnswer;
    expect(question?.["@type"]).toBe("Question");
    expect(question?.name).toBe("What is JSON-LD?");
    expect(answer["@type"]).toBe("Answer");
    expect(answer.text).toBe("A serialization format.");
  });

  test("filters out faqs missing title or richText, keeps valid ones", () => {
    const result = faqAccordionToJsonLd({
      categories: category([
        {
          richText: [block("block", [span("Yes.")])],
          title: "Valid?",
        },
        { richText: [block("block", [span("no title")])], title: null },
        { richText: null, title: "No body?" },
      ]),
    });

    expect(result).not.toBeNull();
    const entities = questions(result);
    expect(entities).toHaveLength(1);
    expect(entities[0]?.name).toBe("Valid?");
  });

  test("aggregates valid faqs across multiple categories", () => {
    const result = faqAccordionToJsonLd({
      categories: [
        { faqs: [{ richText: [block("block", [span("A1")])], title: "Q1" }] },
        { faqs: [{ richText: [block("block", [span("A2")])], title: "Q2" }] },
      ],
    });

    const entities = questions(result);
    expect(entities).toHaveLength(2);
    expect(entities.at(0)?.name).toBe("Q1");
    expect(entities.at(1)?.name).toBe("Q2");
  });

  test("joins multiple spans across multiple blocks", () => {
    const result = faqAccordionToJsonLd({
      categories: category([
        {
          richText: [
            block("block", [span("First. "), span("Second.")]),
            block("block", [span("Third.")]),
          ],
          title: "Multi-block?",
        },
      ]),
    });

    const entities = questions(result);
    const answer = entities[0]?.acceptedAnswer as JsonLdAnswer;
    expect(answer.text).toBe("First. Second. Third.");
  });

  test("ignores non-block rich text nodes", () => {
    const result = faqAccordionToJsonLd({
      categories: category([
        {
          richText: [
            { _type: "image", children: [span("should be ignored")] },
            block("block", [span("Only text.")]),
          ],
          title: "Image block?",
        },
      ]),
    });

    const entities = questions(result);
    const answer = entities[0]?.acceptedAnswer as JsonLdAnswer;
    expect(answer.text).toBe("Only text.");
  });
});
