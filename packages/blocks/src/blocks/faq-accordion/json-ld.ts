import type { Answer, FAQPage, Question, WithContext } from "schema-dts";

interface RichTextChild {
  _type: string;
  text?: string;
}
interface RichTextBlock {
  _type: string;
  children?: RichTextChild[];
}

interface FaqInput {
  title?: string | null;
  richText?: RichTextBlock[] | null;
}
interface FaqCategoryInput {
  faqs?: FaqInput[] | null;
}

export interface FaqAccordionInput {
  categories?: FaqCategoryInput[] | null;
}

const extractPlainText = (richText: RichTextBlock[]): string =>
  richText
    .filter((block) => block._type === "block" && Array.isArray(block.children))
    .map((block) =>
      (block.children ?? [])
        .filter((child) => child._type === "span")
        .map((child) => child.text ?? "")
        .join("")
    )
    .join(" ")
    .trim();

/** Caller must stega-clean the block before serialization. */
export const faqAccordionToJsonLd = (
  block: FaqAccordionInput
): WithContext<FAQPage> | null => {
  const sourceFaqs = (block.categories ?? []).flatMap(
    (category) => category?.faqs ?? []
  );
  const validFaqs = sourceFaqs.filter(
    (faq): faq is FaqInput & { title: string; richText: RichTextBlock[] } =>
      Boolean(faq.title && faq.richText)
  );
  if (!validFaqs.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map((faq): Question => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: extractPlainText(faq.richText),
      } as Answer,
      name: faq.title,
    })),
  };
};
