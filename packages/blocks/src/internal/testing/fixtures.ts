import type { RichTextValue } from "../rich-text";
import type { ButtonProps } from "../sanity-buttons";
import type { SanityImageData } from "../sanity-image";

/**
 * Shared fixtures for Storybook stories. Images point at the Sanity CDN with
 * synthetic asset ids, so the LQIP `preview` (an inline SVG) is what renders
 * in Storybook; real projects see real assets.
 */

const PALETTE = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

const svgPreview = (color: string, width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`
  )}`;

export function placeholderImage(
  seed: number,
  { width = 1200, height = 800, alt = `Placeholder ${seed}` } = {}
): SanityImageData {
  const color = PALETTE[seed % PALETTE.length] ?? "#6366f1";
  // Asset ids carry a hex hash; the image library rejects anything else.
  const hash = seed.toString(16).padStart(40, "a");
  return {
    id: `image-${hash}-${width}x${height}-png`,
    alt,
    preview: svgPreview(color, width, height),
  };
}

let blockCounter = 0;

export function paragraph(text: string, style = "normal"): RichTextValue {
  blockCounter += 1;
  return [
    {
      _type: "block",
      _key: `block-${blockCounter}`,
      style,
      markDefs: [],
      children: [
        { _type: "span", _key: `span-${blockCounter}`, text, marks: [] },
      ],
    },
  ];
}

export function paragraphs(...texts: string[]): RichTextValue {
  return texts.flatMap((text) => paragraph(text) ?? []);
}

export const buttons: ButtonProps[] = [
  {
    _key: "btn-1",
    text: "Get started",
    variant: "default",
    href: "/get-started",
  },
  {
    _key: "btn-2",
    text: "View on GitHub",
    variant: "outline",
    href: "https://github.com",
    openInNewTab: true,
  },
];

/** Mux's public sample clip, used in their own documentation. */
export const MUX_SAMPLE = {
  playbackId: "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe",
  status: "ready",
  policy: "public",
  aspectRatio: "16:9",
  title: "Sample clip",
} as const;
