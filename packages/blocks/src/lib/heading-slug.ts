import slugify from "slugify";

const textOf = (child: unknown): string => {
  if (typeof child !== "object" || child === null || !("text" in child)) {
    return "";
  }
  const { text } = child as { text?: unknown };
  return typeof text === "string" ? text : "";
};

export const headingTextToSlug = (text: string): string =>
  slugify(text.trim(), { lower: true, remove: /[^a-zA-Z0-9 ]/gu });

/**
 * The anchor `id` the rich-text renderer stamps on a heading. Marks split a
 * heading into several Portable Text spans, sometimes mid-word, so the span
 * texts are joined as they are before slugifying.
 */
export const headingChildrenToSlug = (
  children: readonly unknown[] | null | undefined
): string => {
  if (!children) {
    return "";
  }
  return headingTextToSlug(children.map(textOf).join(""));
};
