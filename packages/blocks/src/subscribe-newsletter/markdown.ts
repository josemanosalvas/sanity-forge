import {
  eyebrowToMarkdown,
  headingToMarkdown,
  joinSections,
} from "../lib/markdown";
import type { MarkdownBlock, MarkdownOptions } from "../lib/markdown";
import {
  escapeMarkdown,
  portableTextToMarkdown,
} from "../lib/portable-text-to-markdown";

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

  // `helperText` is the form's small print; the rendered block shows it only
  // together with a form, which needs a handler the page builder does not
  // pass, so the Markdown mirrors the page and omits it too.
  return joinSections([
    headingToMarkdown(block.title, 2),
    portableTextToMarkdown(block.subTitle, options),
    eyebrowToMarkdown(testimonial?.eyebrow),
    portableTextToMarkdown(testimonial?.quote, options),
    attribution ? `— ${attribution}` : "",
  ]);
};
