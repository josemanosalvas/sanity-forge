import { isPortableTextTextBlock } from "sanity";
import type { StringOptions } from "sanity";

const isRelativeUrl = (url: string) =>
  url.startsWith("/") || url.startsWith("#") || url.startsWith("?");

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export const isValidUrl = (url: string) => {
  try {
    return ALLOWED_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return isRelativeUrl(url);
  }
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const getTitleCase = (name: string) =>
  capitalize(name.replaceAll(/(?<upper>[A-Z])/gu, " $<upper>"));

export const createRadioListLayout = (
  items: (string | { title: string; value: string })[],
  options?: StringOptions
): StringOptions => {
  const list = items.map((item) => {
    if (typeof item === "string") {
      return {
        title: getTitleCase(item),
        value: item,
      };
    }
    return item;
  });
  return {
    layout: "radio",
    list,
    ...options,
  };
};

interface LinkPreviewSelection {
  externalUrl?: string | null;
  internalUrl?: string | null;
  openInNewTab?: boolean | null;
  urlType?: string | null;
}

const PREVIEW_URL_LENGTH = 30;

/** Where a `customUrl` points, for list previews; `↗` marks a new tab. */
export const linkPreviewTarget = ({
  externalUrl,
  internalUrl,
  openInNewTab,
  urlType,
}: LinkPreviewSelection): string => {
  const url = urlType === "external" ? externalUrl : internalUrl;
  if (!url) {
    return "No link";
  }
  const shown =
    url.length > PREVIEW_URL_LENGTH
      ? `${url.slice(0, PREVIEW_URL_LENGTH)}...`
      : url;
  return openInNewTab ? `${shown} ↗` : shown;
};

export const linkPreviewSubtitle = (link: LinkPreviewSelection): string =>
  `${link.urlType === "external" ? "External" : "Internal"} • ${linkPreviewTarget(link)}`;

/** Preview for a column of links: its title and how many links it holds. */
export const columnPreview = ({
  links,
  title,
}: {
  links?: readonly unknown[] | null;
  title?: string | null;
}) => {
  const count = links?.length ?? 0;
  return {
    subtitle: `${count} link${count === 1 ? "" : "s"}`,
    title: title || "Untitled Column",
  };
};

export const parseRichTextToString = (value: unknown, maxWords?: number) => {
  if (!Array.isArray(value)) {
    return "No Content";
  }

  const text = value
    .map((val) => {
      if (!isPortableTextTextBlock(val)) {
        return "";
      }
      return val.children
        .map((child) => child.text)
        .filter(Boolean)
        .join(" ");
    })
    .join(" ");
  const words = text.split(" ");
  if (maxWords && words.length > maxWords) {
    return `${words.slice(0, maxWords).join(" ")}...`;
  }
  return text;
};
