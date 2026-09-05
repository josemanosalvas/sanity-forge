import {
  buttonsToMarkdown,
  eyebrowToMarkdown,
  headingToMarkdown,
  imageToMarkdown,
  joinSections,
  muxVideoToMarkdown,
} from "../../lib/markdown";
import type {
  MarkdownBlock,
  MarkdownOptions,
  MarkdownVideoVariant,
} from "../../lib/markdown";
import { portableTextToMarkdown } from "../../lib/portable-text-to-markdown";
import { isMuxPath, mediaTypeOf } from "./media-type";

export const heroToMarkdown = (
  block: MarkdownBlock,
  options: MarkdownOptions
): string => {
  // Keep poster and clip from the same theme, matching the rendered hero.
  const stillOf = (variant?: MarkdownVideoVariant | null) => {
    if (variant?.poster) {
      return imageToMarkdown(variant.poster, options);
    }
    return isMuxPath(mediaTypeOf(variant))
      ? muxVideoToMarkdown(variant?.mux, block.title)
      : "";
  };

  return joinSections([
    eyebrowToMarkdown(block.badge),
    headingToMarkdown(block.title, 2),
    portableTextToMarkdown(block.richText, options),
    stillOf(block.video?.light) || stillOf(block.video?.dark),
    buttonsToMarkdown(block.buttons, options),
  ]);
};
