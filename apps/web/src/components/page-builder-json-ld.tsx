import { faqAccordionToJsonLd } from "@repo/blocks/faq-accordion/json-ld";
import { JsonLd } from "@repo/seo/json-ld";
import { stegaClean } from "next-sanity";

import type { PageBuilderBlock, PagebuilderType } from "@/types";

/**
 * One FAQPage for the whole page: search engines read a single FAQPage per
 * URL, so every FAQ block's questions are merged.
 */
export const PageBuilderJsonLd = ({
  pageBuilder,
}: Readonly<{ pageBuilder?: PageBuilderBlock[] | null }>) => {
  if (!pageBuilder?.length) {
    return null;
  }

  const questions = pageBuilder.flatMap((block) => {
    if (block?._type !== "faqAccordion") {
      return [];
    }
    const data = faqAccordionToJsonLd(
      stegaClean(block as PagebuilderType<"faqAccordion">)
    );
    return data?.mainEntity ?? [];
  });

  if (!questions.length) {
    return null;
  }

  return (
    <JsonLd
      code={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions,
      }}
      id="faq-json-ld"
    />
  );
};
