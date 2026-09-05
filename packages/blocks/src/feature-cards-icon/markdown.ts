import {
  eyebrowToMarkdown,
  headingToMarkdown,
  joinSections,
} from "../internal/markdown";
import type { MarkdownBlock, MarkdownOptions } from "../internal/markdown";
import { portableTextToMarkdown } from "../internal/portable-text-to-markdown";

export const featureCardsIconToMarkdown = (
  block: MarkdownBlock,
  options: MarkdownOptions
): string => {
  const cards = (block.cards ?? []).map((card) =>
    joinSections([
      headingToMarkdown(card.title, 3),
      portableTextToMarkdown(card.richText, options),
    ])
  );

  return joinSections([
    eyebrowToMarkdown(block.eyebrow),
    headingToMarkdown(block.title, 2),
    portableTextToMarkdown(block.richText, options),
    ...cards,
  ]);
};
