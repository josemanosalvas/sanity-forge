import {
  buttonsToMarkdown,
  eyebrowToMarkdown,
  headingToMarkdown,
  joinSections,
} from "../lib/markdown";
import type { MarkdownBlock, MarkdownOptions } from "../lib/markdown";
import { portableTextToMarkdown } from "../lib/portable-text-to-markdown";

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
