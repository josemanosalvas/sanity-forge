import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { HeroBlock } from "./hero";

describe(HeroBlock, () => {
  test("HeroBlock renders the title and button content", () => {
    const html = renderToStaticMarkup(
      <HeroBlock
        badge="New"
        title="Ship shared Sanity blocks"
        richText={[
          {
            _key: "block-1",
            _type: "block",
            children: [
              { _type: "span", text: "Reusable frontend and schema code." },
            ],
          },
        ]}
        buttons={[
          {
            _key: "btn-1",
            href: "https://example.com",
            text: "Start now",
          },
        ]}
      />
    );

    expect(html).toMatch(/Ship shared Sanity blocks/u);
    expect(html).toMatch(/Start now/u);
    expect(html).toMatch(/New/u);
  });

  test("HeroBlock renders without image when not provided", () => {
    const html = renderToStaticMarkup(<HeroBlock title="No image test" />);

    expect(html).toMatch(/No image test/u);
  });

  // The leading hero's page-builder wrapper is `display: contents`, which
  // measures 0x0 in the visual editing overlay. Both of the boxes it renders
  // instead have to carry the attribute: one resolving to the page-builder array
  // rather than the block makes that half refuse to drag.
  test("leading HeroBlock puts the visual editing attribute on both boxes", () => {
    const html = renderToStaticMarkup(
      <HeroBlock dataSanity="drag-me" isFirst title="Pinned" />
    );

    expect(html.match(/data-sanity="drag-me"/gu)).toHaveLength(2);
    // Anchored on the banner box's id, not its classes — it pins only from `lg`
    // up, so matching a bare `sticky` misses it.
    expect(html).toMatch(/<div[^>]*data-sanity="drag-me"[^>]*id="hero"/u);
  });

  const READY_MUX = {
    aspectRatio: "16:9",
    playbackId: "abc123",
    policy: "public",
    status: "ready",
  };

  test("HeroBlock falls back to the Mux still when no picture is set", () => {
    const html = renderToStaticMarkup(
      <HeroBlock isFirst title="H" video={{ light: { mux: READY_MUX } }} />
    );
    expect(html).toContain("https://image.mux.com/abc123/thumbnail.webp");
  });

  test("HeroBlock renders one still per theme only when they differ", () => {
    const shared = renderToStaticMarkup(
      <HeroBlock
        isFirst
        title="H"
        video={{ dark: { mux: READY_MUX }, light: { mux: READY_MUX } }}
      />
    );
    expect(shared.match(/dark:hidden/gu)).toBeNull();

    const split = renderToStaticMarkup(
      <HeroBlock
        isFirst
        title="H"
        video={{
          dark: { mux: { ...READY_MUX, playbackId: "def456" } },
          light: { mux: READY_MUX },
        }}
      />
    );
    expect(split).toContain("dark:hidden");
    expect(split).toContain("def456");
  });

  // The two delivery paths have to be selectable on the same site, or the
  // comparison pages measure nothing. `HeroVideo` mounts client-side, so the
  // server render carries the still only — which is exactly what must differ:
  // a hero served from Sanity must never reach image.mux.com for its poster.
  test("a sanity-delivered hero does not borrow the Mux still", () => {
    const html = renderToStaticMarkup(
      <HeroBlock
        isFirst
        title="H"
        video={{
          light: {
            mediaType: "sanity",
            mux: READY_MUX,
            webm: "https://cdn.sanity.io/files/p/d/hero.webm",
          },
        }}
      />
    );

    expect(html).not.toContain("image.mux.com");
  });

  test("a mux-delivered hero still falls back to the Mux still", () => {
    const html = renderToStaticMarkup(
      <HeroBlock
        isFirst
        title="H"
        video={{ light: { mediaType: "mux", mux: READY_MUX } }}
      />
    );

    expect(html).toContain("https://image.mux.com/abc123/thumbnail.webp");
  });

  // A hero authored before the toggle has no `mediaType` at all. It must keep
  // rendering from whichever path it actually carries.
  test("a hero with no mediaType keeps rendering from what it carries", () => {
    const files = renderToStaticMarkup(
      <HeroBlock
        isFirst
        title="H"
        video={{ light: { webm: "https://cdn.sanity.io/files/p/d/hero.webm" } }}
      />
    );
    expect(files).not.toContain("image.mux.com");

    const mux = renderToStaticMarkup(
      <HeroBlock isFirst title="H" video={{ light: { mux: READY_MUX } }} />
    );
    expect(mux).toContain("image.mux.com");
  });
});
