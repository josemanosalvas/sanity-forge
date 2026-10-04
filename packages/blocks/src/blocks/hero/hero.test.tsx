import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HeroBlock } from "./hero";

describe(HeroBlock, () => {
  it("HeroBlock renders the title and button content", () => {
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

  it("HeroBlock renders without image when not provided", () => {
    const html = renderToStaticMarkup(<HeroBlock title="No image test" />);

    expect(html).toMatch(/No image test/u);
  });

  // The display:contents wrapper has no overlay box; both hero boxes need data-sanity.
  it("leading HeroBlock puts the visual editing attribute on both boxes", () => {
    const html = renderToStaticMarkup(
      <HeroBlock dataSanity="drag-me" isFirst title="Pinned" />
    );

    expect(html.match(/data-sanity="drag-me"/gu)).toHaveLength(2);
    expect(html).toMatch(/<div[^>]*data-sanity="drag-me"[^>]*id="hero"/u);
  });

  const READY_MUX = {
    aspectRatio: "16:9",
    playbackId: "abc123",
    policy: "public",
    status: "ready",
  };

  it("only the leading hero fetches its still eagerly", () => {
    const leading = renderToStaticMarkup(
      <HeroBlock isFirst title="H" video={{ light: { mux: READY_MUX } }} />
    );
    expect(leading).toMatch(/<img[^>]*fetchpriority="high"/iu);
    expect(leading).toMatch(/<img[^>]*loading="eager"/u);
    expect(leading).toMatch(/srcset="[^"]*thumbnail\.webp\?width=640 640w/iu);

    const later = renderToStaticMarkup(
      <HeroBlock title="H" video={{ light: { mux: READY_MUX } }} />
    );
    expect(later).not.toMatch(/fetchpriority/iu);
    expect(later).toMatch(/<img[^>]*loading="lazy"/u);
  });

  it("HeroBlock falls back to the Mux still when no picture is set", () => {
    const html = renderToStaticMarkup(
      <HeroBlock isFirst title="H" video={{ light: { mux: READY_MUX } }} />
    );
    expect(html).toContain("https://image.mux.com/abc123/thumbnail.webp");
  });

  it("HeroBlock renders one still per theme only when they differ", () => {
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

  // SSR exposes the poster, so assert the selected CDN there.
  it("a sanity-delivered hero does not borrow the Mux still", () => {
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

  it("a mux-delivered hero still falls back to the Mux still", () => {
    const html = renderToStaticMarkup(
      <HeroBlock
        isFirst
        title="H"
        video={{ light: { mediaType: "mux", mux: READY_MUX } }}
      />
    );

    expect(html).toContain("https://image.mux.com/abc123/thumbnail.webp");
  });

  it("a hero with no mediaType keeps rendering from what it carries", () => {
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
