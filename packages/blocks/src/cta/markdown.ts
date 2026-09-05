import {
  buttonsToMarkdown,
  eyebrowToMarkdown,
  headingToMarkdown,
  joinSections,
} from "../internal/markdown";
import type { MarkdownBlock, MarkdownOptions } from "../internal/markdown";
import { portableTextToMarkdown } from "../internal/portable-text-to-markdown";

export const ctaToMarkdown = (
  block: MarkdownBlock,
  options: MarkdownOptions
): string =>
  joinSections([
    eyebrowToMarkdown(block.eyebrow),
    headingToMarkdown(block.title, 2),
    portableTextToMarkdown(block.richText, options),
    buttonsToMarkdown(block.buttons, options),
  ]);
