import {
  eyebrowToMarkdown,
  headingToMarkdown,
  joinSections,
  mdLink,
} from "../../lib/markdown";
import type { MarkdownBlock, MarkdownOptions } from "../../lib/markdown";
import { escapeMarkdown } from "../../lib/portable-text-to-markdown";

export const socialGridToMarkdown = (
  block: MarkdownBlock,
  options: MarkdownOptions
): string => {
  const socials = (block.socials ?? [])
    .map((social) => {
      const label = (social.label ?? social.platform ?? "").trim();
      if (!label) {
        return "";
      }
      return `- ${mdLink(label, social.href, options)}`;
    })
    .filter(Boolean);

  const subtitle = block.subtitle?.trim();

  return joinSections([
    eyebrowToMarkdown(block.eyebrow),
    headingToMarkdown(block.title, 2),
    subtitle ? escapeMarkdown(subtitle) : "",
    socials.length > 0 ? socials.join("\n") : "",
  ]);
};
