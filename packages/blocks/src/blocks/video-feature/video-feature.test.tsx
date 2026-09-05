import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  BlockLabelsProvider,
  defaultBlockLabels,
} from "../../components/block-labels";
import { VideoFeature } from "./video-feature";

const render = (props: Parameters<typeof VideoFeature>[0]) =>
  renderToStaticMarkup(<VideoFeature {...props} />);

describe(VideoFeature, () => {
  const READY = { playbackId: "abc123", policy: "public", status: "ready" };

  // The dynamic player renders only in the browser.
  test("VideoFeature renders the copy and a poster to press", () => {
    const html = render({
      caption: "Recorded live",
      eyebrow: "Watch",
      title: "The tour",
      video: { asset: READY },
    });

    expect(html).toMatch(/Watch/u);
    expect(html).toMatch(/The tour/u);
    expect(html).toMatch(/Recorded live/u);
    expect(html).toMatch(/aria-label="Play video: The tour"/u);
    expect(html).toMatch(
      /https:\/\/image\.mux\.com\/abc123\/thumbnail\.webp\?width=1200/u
    );
  });

  test.each([
    ["no upload yet", undefined],
    [
      "a failed encode",
      { playbackId: "abc123", policy: "public", status: "errored" },
    ],
    // Signed and DRM playback needs a JWT this starter never mints.
    [
      "a non-public playback policy",
      { playbackId: "abc123", policy: "signed", status: "ready" },
    ],
    // A weak reference to a deleted asset: GROQ still returns the object.
    [
      "a dangling reference",
      {
        aspectRatio: null,
        playbackId: null,
        status: null,
        thumbTime: null,
        title: null,
      },
    ],
  ])(
    "VideoFeature keeps the copy but drops the video with %s",
    (_label, asset) => {
      const html = render({
        caption: "Recorded live",
        eyebrow: "Watch",
        title: "The tour",
        video: { asset },
      });

      expect(html).toMatch(/Watch/u);
      expect(html).toMatch(/The tour/u);
      expect(html).toMatch(/Recorded live/u);
      expect(html).not.toMatch(/Play video/u);
      expect(html).not.toMatch(/image\.mux\.com/u);
    }
  );

  test("VideoFeature posters from the editor's chosen frame", () => {
    const html = render({
      title: "The tour",
      video: { asset: { ...READY, thumbTime: 12.5 } },
    });

    expect(html).toContain(
      "https://image.mux.com/abc123/thumbnail.webp?time=12.5&amp;width=1200"
    );
  });

  // Autoplay skips the facade; the player renders only in the browser.
  test("VideoFeature skips the facade when the editor asks for autoplay", () => {
    const html = render({
      title: "The tour",
      video: { asset: READY, autoPlay: true },
    });

    expect(html).not.toMatch(/Play video/u);
    expect(html).toMatch(/The tour/u);
  });

  test("VideoFeature reserves the box from Mux's aspect ratio", () => {
    const html = render({
      title: "The tour",
      video: { asset: { ...READY, aspectRatio: "21:9" } },
    });

    expect(html).toMatch(/aspect-ratio:21\/9/u);
  });

  // Keep stega for visible editable text; strip it from metadata and accessible names.
  test("VideoFeature strips stega from the title it passes on", () => {
    const zeroWidth = "\u200B\u200C\u200B\u200C";
    const html = render({
      title: `The tour${zeroWidth}`,
      video: { asset: READY },
    });
    const label =
      html.match(/aria-label="(?<label>[^"]*)"/u)?.groups?.label ?? "";

    expect(label).toBe("Play video: The tour");
    expect(html).toContain(zeroWidth);
  });

  test("VideoFeature names the play button in the labels the site provides", () => {
    const html = renderToStaticMarkup(
      <BlockLabelsProvider
        labels={{
          ...defaultBlockLabels,
          playVideo: (title) =>
            title ? `Video abspielen: ${title}` : "Video abspielen",
        }}
      >
        <VideoFeature title="Die Tour" video={{ asset: READY }} />
      </BlockLabelsProvider>
    );

    expect(html).toMatch(/aria-label="Video abspielen: Die Tour"/u);
    expect(html).not.toMatch(/Play video/u);
  });
});
