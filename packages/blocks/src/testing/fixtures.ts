import type { RichTextValue } from "../components/rich-text";
import type { ButtonProps } from "../components/sanity-buttons";
import type { SanityImageData } from "../components/sanity-image";

/** Synthetic asset IDs use inline SVG previews in Storybook. */

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

export const placeholderImage = (
  seed: number,
  { width = 1200, height = 800, alt = `Placeholder ${seed}` } = {}
): SanityImageData => {
  const color = PALETTE[seed % PALETTE.length] ?? "#6366f1";
  // Asset ids carry a hex hash; the image library rejects anything else.
  const hash = seed.toString(16).padStart(40, "a");
  return {
    alt,
    id: `image-${hash}-${width}x${height}-png`,
    preview: svgPreview(color, width, height),
  };
};

let blockCounter = 0;

export const paragraph = (text: string, style = "normal"): RichTextValue => {
  blockCounter += 1;
  return [
    {
      _key: `block-${blockCounter}`,
      _type: "block",
      children: [
        { _key: `span-${blockCounter}`, _type: "span", marks: [], text },
      ],
      markDefs: [],
      style,
    },
  ];
};

export const paragraphs = (...texts: string[]): RichTextValue =>
  texts.flatMap((text) => paragraph(text) ?? []);

export const buttons: ButtonProps[] = [
  {
    _key: "btn-1",
    href: "/get-started",
    text: "Get started",
    variant: "default",
  },
  {
    _key: "btn-2",
    href: "https://github.com",
    openInNewTab: true,
    text: "View on GitHub",
    variant: "outline",
  },
];

/** Mux's public sample clip, used in their own documentation. */
export const MUX_SAMPLE = {
  aspectRatio: "16:9",
  playbackId: "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe",
  policy: "public",
  status: "ready",
  title: "Sample clip",
} as const;
