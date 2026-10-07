import { describe, expect, it } from "vitest";

import {
  capitalize,
  columnPreview,
  createRadioListLayout,
  getTitleCase,
  isValidUrl,
  linkPreviewSubtitle,
  linkPreviewTarget,
  parseRichTextToString,
} from "./helpers";

const textBlock = (text: string) => ({
  _key: text,
  _type: "block",
  children: [{ _key: `${text}-span`, _type: "span", marks: [], text }],
  markDefs: [],
  style: "normal",
});

describe(isValidUrl, () => {
  it.each([
    "https://example.com",
    "http://example.com/about",
    "mailto:hello@example.com",
    "tel:+15551234567",
    "/about",
    "/products/cloud",
    "#features",
    "?q=cloud",
  ])("accepts %s", (url) => expect(isValidUrl(url)).toBeTruthy());

  it.each([
    // oxlint-disable-next-line no-script-url -- the unsafe scheme is the input under test
    "javascript:alert(1)",
    // oxlint-disable-next-line no-script-url -- the URL parser lower-cases the protocol, so casing cannot slip past the allowlist
    "JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "ftp://example.com/pub",
    "example.com",
    "",
  ])("rejects %s", (url) => expect(isValidUrl(url)).toBeFalsy());

  it("accepts a protocol-relative address as if it were a path", () => {
    // `//host` fails to parse without a base, so the relative branch takes it.
    // Rendering is where it is caught: `sanitizeHref` in @repo/blocks drops it.
    expect(isValidUrl("//evil.com")).toBeTruthy();
  });
});

describe(capitalize, () => {
  it("upper-cases the first character only", () =>
    expect(capitalize("brand a")).toBe("Brand a"));

  it("leaves an empty string alone", () => expect(capitalize("")).toBe(""));
});

describe(getTitleCase, () => {
  it("splits a camelCase field name into words", () =>
    expect(getTitleCase("openInNewTab")).toBe("Open In New Tab"));

  it("leaves an empty string alone", () => expect(getTitleCase("")).toBe(""));
});

describe(createRadioListLayout, () => {
  it("title-cases bare values and keeps explicit entries", () => {
    expect(
      createRadioListLayout(["internal", { title: "Shared", value: "faq" }])
    ).toStrictEqual({
      layout: "radio",
      list: [
        { title: "Internal", value: "internal" },
        { title: "Shared", value: "faq" },
      ],
    });
  });

  it("lets options override the radio default", () =>
    expect(
      createRadioListLayout(["internal"], { layout: "dropdown" })
    ).toStrictEqual({
      layout: "dropdown",
      list: [{ title: "Internal", value: "internal" }],
    }));
});

describe(linkPreviewTarget, () => {
  it("shows where an external or internal link points", () => {
    expect(
      linkPreviewTarget({
        externalUrl: "https://example.com",
        urlType: "external",
      })
    ).toBe("https://example.com");
    expect(
      linkPreviewTarget({ internalUrl: "/about", urlType: "internal" })
    ).toBe("/about");
  });

  it("marks a new tab and shortens long addresses", () =>
    expect(
      linkPreviewTarget({
        externalUrl: "https://example.com/a/very/long/path",
        openInNewTab: true,
        urlType: "external",
      })
    ).toBe("https://example.com/a/very/lon... ↗"));

  it("names a missing target instead of printing undefined", () =>
    expect(linkPreviewTarget({ urlType: "internal" })).toBe("No link"));
});

describe(linkPreviewSubtitle, () => {
  it("prefixes the link type", () =>
    expect(
      linkPreviewSubtitle({ internalUrl: "/about", urlType: "internal" })
    ).toBe("Internal • /about"));
});

describe(columnPreview, () => {
  it("counts the column's links", () =>
    expect(columnPreview({ links: [{}], title: "About" })).toStrictEqual({
      subtitle: "1 link",
      title: "About",
    }));

  it("names an empty, untitled column", () =>
    expect(columnPreview({})).toStrictEqual({
      subtitle: "0 links",
      title: "Untitled Column",
    }));
});

describe(parseRichTextToString, () => {
  it("joins the text of every block", () =>
    expect(
      parseRichTextToString([textBlock("Hello"), textBlock("world")])
    ).toBe("Hello world"));

  it("truncates to the requested word count", () =>
    expect(parseRichTextToString([textBlock("one two three")], 2)).toBe(
      "one two..."
    ));

  it("adds no ellipsis to text within the word count", () =>
    expect(parseRichTextToString([textBlock("one two")], 2)).toBe("one two"));

  it("contributes nothing for a block that holds no text", () =>
    // A non-text block joins as an empty string, hence the leading separator.
    expect(
      parseRichTextToString([{ _type: "image" }, textBlock("Hello")])
    ).toBe(" Hello"));

  it.each([undefined, null, "already a string", {}])(
    "reports missing content for %o",
    (value) => expect(parseRichTextToString(value)).toBe("No Content")
  );
});
