import {
  eyebrowToMarkdown,
  headingToMarkdown,
  joinSections,
} from "../../lib/markdown";
import type { MarkdownBlock, MarkdownOptions } from "../../lib/markdown";
import {
  escapeMarkdown,
  portableTextToMarkdown,
} from "../../lib/portable-text-to-markdown";

export const subscribeNewsletterToMarkdown = (
  block: MarkdownBlock,
  options: MarkdownOptions
): string => {
  const { testimonial } = block;
  const attribution = [testimonial?.authorName, testimonial?.authorRole]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map((value) => escapeMarkdown(value))
    .join(", ");

  // Omit helperText because the page builder supplies no form handler and
  // the rendered block hides the form and its helper text in that case.
  return joinSections([
    headingToMarkdown(block.title, 2),
    portableTextToMarkdown(block.subTitle, options),
    eyebrowToMarkdown(testimonial?.eyebrow),
    portableTextToMarkdown(testimonial?.quote, options),
    attribution,
  ]);
};
