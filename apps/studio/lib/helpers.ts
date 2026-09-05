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

export const getTitleCase = (name: string) => {
  const titleTemp = name.replaceAll(/([A-Z])/g, " $1");
  return titleTemp.charAt(0).toUpperCase() + titleTemp.slice(1);
};

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

export const parseRichTextToString = (
  value: unknown,
  maxWords: number | undefined
) => {
  if (!Array.isArray(value)) {
    return "No Content";
  }

  const text = value.map((val) => {
    if (!isPortableTextTextBlock(val)) {
      return "";
    }
    return val.children
      .map((child) => child.text)
      .filter(Boolean)
      .join(" ");
  });
  if (maxWords) {
    return `${text.join(" ").split(" ").slice(0, maxWords).join(" ")}...`;
  }
  return text.join(" ");
};
