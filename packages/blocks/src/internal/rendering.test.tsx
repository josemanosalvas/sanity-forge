import { TriangleAlert } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  getHref,
  IconBadge,
  portableTextToPlainText,
  renderButtons,
  renderOptionalHeading,
  renderPortableText,
} from "./rendering";

describe("internal/rendering", () => {
  test("getHref is undefined without a url", () => {
    expect(getHref()).toBeUndefined();
  });

  test.each([
    ["/shared-blocks", "/shared-blocks"],
    ["shared-blocks", "/shared-blocks"],
    ["///shared-blocks", "/shared-blocks"],
    [null, undefined],
  ])("getHref normalizes the internal slug %s to %s", (current, expected) => {
    expect(getHref({ internal: { slug: { current } }, type: "internal" })).toBe(
      expected
    );
  });

  test("getHref passes external urls through", () => {
    expect(getHref({ external: "https://example.com", type: "external" })).toBe(
      "https://example.com"
    );
    expect(getHref({ type: "external" })).toBeUndefined();
  });

  test("portable text helpers flatten and render images, headings, and empty blocks", () => {
    expect(portableTextToPlainText()).toBe("");
    expect(
      portableTextToPlainText([
        {
          _type: "image",
          caption: "Caption copy",
        },
        {
          _type: "image",
          alt: "Alt copy",
        },
        {
          _type: "image",
        },
        {
          _type: "block",
          children: [
            { _type: "span", text: "Hello " },
            { _type: "span", text: "world" },
          ],
        },
        {
          _type: "block",
          children: [{ _type: "span" }],
        },
        {
          _type: "block",
          children: null,
        },
      ])
    ).toBe("Caption copy Alt copy Hello world");

    const html = renderToStaticMarkup(
      renderPortableText([
        {
          _type: "image",
          alt: "Inline image alt",
        },
        {
          _type: "image",
        },
        {
          _type: "block",
          children: [{ _type: "span", text: "Heading copy" }],
          style: "h2",
        },
        {
          _type: "block",
          children: [{ _type: "span", text: "Body copy" }],
        },
        {
          _type: "block",
          children: [{ _type: "span", text: "   " }],
        },
        {
          _type: "block",
          children: [{ _type: "span" }],
        },
        {
          _type: "block",
          children: null,
        },
      ])
    );

    expect(html).toBe(
      "<p>Inline image alt</p><h2>Heading copy</h2><p>Body copy</p>"
    );
  });

  test("renderButtons renders nothing without buttons", () => {
    expect(renderToStaticMarkup(renderButtons())).toBe("");
  });

  const buttons = renderToStaticMarkup(
    renderButtons([
      {
        text: "Read more",
        url: {
          internal: {
            slug: {
              current: "/features",
            },
          },
          openInNewTab: true,
          type: "internal",
        },
      },
      {
        url: {
          external: "https://example.com/docs",
          type: "external",
        },
      },
      {},
    ])
  );

  test("renderButtons links internal buttons, opening in a new tab when asked", () => {
    expect(buttons).toContain('href="/features"');
    expect(buttons).toContain('target="_blank"');
    expect(buttons).toContain('rel="noopener noreferrer"');
  });

  test("renderButtons falls back to the url as text and skips empty buttons", () => {
    expect(buttons).toContain('href="https://example.com/docs"');
    expect(buttons).toContain(">https://example.com/docs<");
    expect(buttons).not.toContain("<span></span>");
  });

  test("renderOptionalHeading renders nothing without a title", () => {
    expect(renderToStaticMarkup(renderOptionalHeading(undefined, "p"))).toBe(
      ""
    );
  });

  const headingsAndIcons = renderToStaticMarkup(
    <>
      {renderOptionalHeading("Section title", "h2")}
      {renderOptionalHeading("Question title", "h3")}
      {renderOptionalHeading("Eyebrow copy", "p")}
      <IconBadge />
      <IconBadge name="boxes" />
      <TriangleAlert size={24} />
    </>
  );

  test("renderOptionalHeading renders the requested tag", () => {
    expect(headingsAndIcons).toContain("<h2>Section title</h2>");
    expect(headingsAndIcons).toContain("<h3>Question title</h3>");
    expect(headingsAndIcons).toContain("<p>Eyebrow copy</p>");
  });

  test("IconBadge and the icon mocks expose name and size", () => {
    expect(headingsAndIcons).toContain('data-icon="triangle-alert"');
    expect(headingsAndIcons).toContain('data-size="16"');
    expect(headingsAndIcons).toContain('data-size="24"');
    expect(headingsAndIcons).toContain("<span>boxes</span>");
  });

  const iconsWithProps = renderToStaticMarkup(
    <>
      <TriangleAlert
        aria-hidden="true"
        className="icon-stub"
        data-track="one"
      />
      <DynamicIcon
        aria-label="dynamic icon"
        className="dynamic-icon"
        data-track="two"
        name="boxes"
        size={20}
      />
    </>
  );

  test("the static icon mock forwards extra props", () => {
    expect(iconsWithProps).toContain('aria-hidden="true"');
    expect(iconsWithProps).toContain('class="icon-stub"');
    expect(iconsWithProps).toContain('data-track="one"');
  });

  test("the dynamic icon mock forwards extra props", () => {
    expect(iconsWithProps).toContain('aria-label="dynamic icon"');
    expect(iconsWithProps).toContain('class="dynamic-icon"');
    expect(iconsWithProps).toContain('data-track="two"');
  });
});
