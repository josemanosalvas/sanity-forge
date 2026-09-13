import { describe, expect, test } from "vitest";

import {
  capitalize,
  createRadioListLayout,
  getTitleCase,
  isValidUrl,
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
  test.each([
    "https://example.com",
    "http://example.com/about",
    "mailto:hello@example.com",
    "tel:+15551234567",
    "/about",
    "/products/cloud",
    "#features",
    "?q=cloud",
  ])("accepts %s", (url) => expect(isValidUrl(url)).toBeTruthy());

  test.each([
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

  test("accepts a protocol-relative address as if it were a path", () => {
    // `//host` fails to parse without a base, so the relative branch takes it.
    // Rendering is where it is caught: `sanitizeHref` in @repo/blocks drops it.
    expect(isValidUrl("//evil.com")).toBeTruthy();
  });
});

describe(capitalize, () => {
  test("upper-cases the first character only", () =>
    expect(capitalize("brand a")).toBe("Brand a"));

  test("leaves an empty string alone", () => expect(capitalize("")).toBe(""));
});

describe(getTitleCase, () => {
  test("splits a camelCase field name into words", () =>
    expect(getTitleCase("openInNewTab")).toBe("Open In New Tab"));

  test("leaves an empty string alone", () => expect(getTitleCase("")).toBe(""));
});

describe(createRadioListLayout, () => {
  test("title-cases bare values and keeps explicit entries", () => {
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

  test("lets options override the radio default", () =>
    expect(
      createRadioListLayout(["internal"], { layout: "dropdown" })
    ).toStrictEqual({
      layout: "dropdown",
      list: [{ title: "Internal", value: "internal" }],
    }));
});

// oxlint-disable unicorn/no-useless-undefined -- maxWords is a required parameter
describe(parseRichTextToString, () => {
  test("joins the text of every block", () =>
    expect(
      parseRichTextToString([textBlock("Hello"), textBlock("world")], undefined)
    ).toBe("Hello world"));

  test("truncates to the requested word count", () =>
    expect(parseRichTextToString([textBlock("one two three")], 2)).toBe(
      "one two..."
    ));

  test("contributes nothing for a block that holds no text", () =>
    // A non-text block joins as an empty string, hence the leading separator.
    expect(
      parseRichTextToString([{ _type: "image" }, textBlock("Hello")], undefined)
    ).toBe(" Hello"));

  test.each([undefined, null, "already a string", {}])(
    "reports missing content for %o",
    (value) =>
      expect(parseRichTextToString(value, undefined)).toBe("No Content")
  );
});
