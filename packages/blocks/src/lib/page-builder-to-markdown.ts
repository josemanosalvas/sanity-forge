/** Thin dispatcher: each block's Markdown serializer is co-located in its block
 * directory (add a `case` + `markdown.ts` for new blocks). Unknown types return "". */

import { ctaToMarkdown } from "../blocks/cta/markdown";
import { faqAccordionToMarkdown } from "../blocks/faq-accordion/markdown";
import { featureCardsIconToMarkdown } from "../blocks/feature-cards-icon/markdown";
import { heroToMarkdown } from "../blocks/hero/markdown";
import { logoCloudToMarkdown } from "../blocks/logo-cloud/markdown";
import { richTextBlockToMarkdown } from "../blocks/rich-text-block/markdown";
import { showcaseGridToMarkdown } from "../blocks/showcase-grid/markdown";
import { socialGridToMarkdown } from "../blocks/social-grid/markdown";
import { subscribeNewsletterToMarkdown } from "../blocks/subscribe-newsletter/markdown";
import { videoFeatureToMarkdown } from "../blocks/video-feature/markdown";
import type { MarkdownBlock, MarkdownOptions } from "./markdown";

export { imageToMarkdown } from "./markdown";
export type { MarkdownBlock } from "./markdown";

const blockToMarkdown = (
  block: MarkdownBlock,
  options: MarkdownOptions
): string => {
  switch (block?._type) {
    case "hero": {
      return heroToMarkdown(block, options);
    }
    case "cta": {
      return ctaToMarkdown(block, options);
    }
    case "richTextBlock": {
      return richTextBlockToMarkdown(block, options);
    }
    case "featureCardsIcon": {
      return featureCardsIconToMarkdown(block, options);
    }
    case "logoCloud": {
      return logoCloudToMarkdown(block, options);
    }
    case "socialGrid": {
      return socialGridToMarkdown(block, options);
    }
    case "showcaseGrid": {
      return showcaseGridToMarkdown(block, options);
    }
    case "faqAccordion": {
      return faqAccordionToMarkdown(block, options);
    }
    case "subscribeNewsletter": {
      return subscribeNewsletterToMarkdown(block, options);
    }
    case "videoFeature": {
      return videoFeatureToMarkdown(block, options);
    }
    default: {
      return "";
    }
  }
};

export const pageBuilderToMarkdown = (
  blocks?: MarkdownBlock[] | null,
  options: MarkdownOptions = {}
): string => {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return blocks
    .map((block) => blockToMarkdown(block, options))
    .filter((markdown) => markdown.trim())
    .join("\n\n");
};
