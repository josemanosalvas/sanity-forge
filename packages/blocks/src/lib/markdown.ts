import { muxPlaybackId, muxThumbnailUrl } from "./mux";
import type { MuxVideoData } from "./mux";
import {
  absolutizeUrl,
  escapeMarkdown,
  formatUrl,
} from "./portable-text-to-markdown";
import type {
  MarkdownImage,
  MarkdownOptions,
  PortableTextValue,
} from "./portable-text-to-markdown";

export type {
  MarkdownImage,
  MarkdownOptions,
  PortableTextValue,
} from "./portable-text-to-markdown";

export interface MarkdownButton {
  _key?: string | null;
  text?: string | null;
  href?: string | null;
}

export interface MarkdownCard {
  _key?: string | null;
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  image?: MarkdownImage | null;
  richText?: PortableTextValue;
}

export interface MarkdownFaq {
  _key?: string | null;
  _id?: string;
  title?: string | null;
  richText?: PortableTextValue;
}

export interface MarkdownLink {
  title?: string | null;
  description?: string | null;
  href?: string | null;
}

export interface MarkdownLogo {
  _key?: string | null;
  href?: string | null;
  image?: MarkdownImage | null;
}

export interface MarkdownSocial {
  _key?: string | null;
  platform?: string | null;
  label?: string | null;
  href?: string | null;
}

export interface MarkdownShowcaseItem {
  _key?: string | null;
  siteName?: string | null;
  url?: string | null;
  category?: string | null;
}

export interface MarkdownFaqCategory {
  _key?: string | null;
  title?: string | null;
  faqs?: MarkdownFaq[] | null;
}

export interface MarkdownTestimonial {
  eyebrow?: string | null;
  quote?: PortableTextValue;
  authorName?: string | null;
  authorRole?: string | null;
}

export interface MarkdownVideoVariant {
  /** Which delivery path the hero selected — see `hero/media-type`. */
  mediaType?: string | null;
  mux?: MuxVideoData | null;
  poster?: MarkdownImage | null;
}

export interface MarkdownVideo extends MuxVideoData {
  asset?: MuxVideoData | null;
  light?: MarkdownVideoVariant | null;
  dark?: MarkdownVideoVariant | null;
}

export interface MarkdownBlock {
  _type?: string;
  _key?: string;
  title?: string | null;
  caption?: string | null;
  eyebrow?: string | null;
  description?: string | null;
  items?: MarkdownShowcaseItem[] | null;
  badge?: string | null;
  subtitle?: string | null;
  richText?: PortableTextValue;
  subTitle?: PortableTextValue;
  helperText?: PortableTextValue;
  buttons?: MarkdownButton[] | null;
  cards?: MarkdownCard[] | null;
  categories?: MarkdownFaqCategory[] | null;
  link?: MarkdownLink | null;
  logos?: MarkdownLogo[] | null;
  socials?: MarkdownSocial[] | null;
  video?: MarkdownVideo | null;
  testimonial?: MarkdownTestimonial | null;
}

/** Joins defined, non-empty sections with a blank line between them. */
export const joinSections = (sections: (string | null | undefined)[]): string =>
  sections.filter((section) => section?.trim()).join("\n\n");

export const eyebrowToMarkdown = (eyebrow?: string | null): string => {
  const text = eyebrow?.trim().replaceAll(/\s+/gu, " ");
  return text ? `**${escapeMarkdown(text)}**` : "";
};

export const headingToMarkdown = (
  title: string | null | undefined,
  level: 2 | 3
): string => {
  const text = title?.trim().replaceAll(/\s+/gu, " ");
  return text ? `${"#".repeat(level)} ${escapeMarkdown(text)}` : "";
};

export const buttonsToMarkdown = (
  buttons?: MarkdownButton[] | null,
  options: MarkdownOptions = {}
): string => {
  if (!Array.isArray(buttons)) {
    return "";
  }

  return buttons
    .map((button) => {
      const text = (button.text ?? "").trim();
      const { href } = button;
      if (href && href !== "#") {
        const url = formatUrl(absolutizeUrl(href, options.baseUrl));
        return `- [${escapeMarkdown(text || href)}](${url})`;
      }
      return text ? `- ${escapeMarkdown(text)}` : null;
    })
    .filter(Boolean)
    .join("\n");
};

export const imageToMarkdown = (
  image: MarkdownImage | null | undefined,
  options: MarkdownOptions
): string => {
  const alt = (image?.alt ?? "").trim();
  const caption = (image?.caption ?? "").trim();
  const url = image?.id ? options.resolveImageUrl?.(image) : undefined;
  // Mirror portable-text: image when a URL resolves, else caption/alt text.
  if (url) {
    const img = `![${escapeMarkdown(alt)}](${formatUrl(url)})`;
    return caption && caption !== alt
      ? `${img}\n\n_${escapeMarkdown(caption)}_`
      : img;
  }
  return escapeMarkdown(caption || alt);
};

const STILL_WIDTH = 1200;

export const muxVideoToMarkdown = (
  video: MuxVideoData | null | undefined,
  alt?: string | null
): string => {
  const url = muxThumbnailUrl(
    muxPlaybackId(video),
    video?.thumbTime,
    STILL_WIDTH
  );
  if (!url) {
    return "";
  }
  const label = (alt ?? video?.title ?? "").trim();
  return `![${escapeMarkdown(label)}](${formatUrl(url)})`;
};

/** A Markdown link, or plain escaped text when the href is missing or `#`. */
export const mdLink = (
  label: string,
  href?: string | null,
  options: MarkdownOptions = {}
): string =>
  href && href !== "#"
    ? `[${escapeMarkdown(label)}](${formatUrl(absolutizeUrl(href, options.baseUrl))})`
    : escapeMarkdown(label);
