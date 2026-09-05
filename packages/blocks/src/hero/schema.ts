import { Star } from "lucide-react";
import { defineField, defineType } from "sanity";

import {
  buttonsField,
  definePortableTextField,
  muxVideoField,
} from "../lib/schema-fields";

/** The three delivery paths a hero background can take. */
export const HERO_MEDIA_TYPES = ["mux", "mux-mp4", "sanity"] as const;

interface HeroVariantValue {
  mediaType?: string;
  mux?: { asset?: unknown } | null;
  webm?: unknown;
  hevc?: unknown;
  mobileWebm?: unknown;
}

/** Whether a variant carries any hand-encoded file, in any of the three slots. */
const hasFiles = (variant?: HeroVariantValue) =>
  Boolean(variant?.webm || variant?.hevc || variant?.mobileWebm);

/**
 * Absent on everything authored before this field existed. Infer it the way
 * the renderer does (`mediaTypeOf` in `./media-type`): a Mux asset means Mux,
 * anything else means the uploaded files, so the Studio shows and validates
 * the fields that are actually being served.
 */
const selected = (
  variant?: HeroVariantValue
): (typeof HERO_MEDIA_TYPES)[number] => {
  const type = variant?.mediaType;
  if (type === "sanity" || type === "mux-mp4" || type === "mux") {
    return type;
  }
  // The Studio only sees the reference; the renderer also needs a public,
  // ready playback ID, so a broken Mux asset still plays the files on the site.
  return variant?.mux?.asset ? "mux" : "sanity";
};

/** Hides a field unless one of the listed paths is the one selected. */
const showFor =
  (...types: readonly string[]) =>
  (context: { parent?: unknown }) =>
    !types.includes(selected(context.parent as HeroVariantValue));

/**
 * One theme's worth of background, delivered one of two ways.
 *
 * Mux takes a single upload and encodes it for every device. The Sanity path
 * is the hand-encoded set it replaced — an AV1 `.webm` for most browsers, an
 * HEVC `.mp4` for Safari, and a smaller `.webm` for phones. Both are kept so
 * the two can be measured against each other on the same page.
 *
 * The picture covers the load, stands alone when there is no video, and falls
 * back to the clip's own opening frame when skipped.
 */
const videoVariantFields = () => [
  defineField({
    description:
      "Where this background is served from. Mux encodes one upload for every device. Sanity serves the files you upload below, exactly as encoded.",
    initialValue: "sanity",
    name: "mediaType",
    options: {
      layout: "radio",
      list: [
        {
          title: "Mux — one upload, adapts to the connection",
          value: "mux",
        },
        {
          title: "Mux as a single file — lighter, does not adapt",
          value: "mux-mp4",
        },
        { title: "Sanity — your own encoded files", value: "sanity" },
      ],
    },
    title: "Video Source",
    type: "string",
    validation: (Rule) => Rule.required(),
  }),
  muxVideoField({
    hidden: showFor("mux", "mux-mp4"),
    name: "mux",
    title: "Video",
  }),
  defineField({
    description:
      "The .webm file, encoded as AV1. Most people see this one. The AV1 codec is declared to the browser so Safari skips it and takes the .mp4 instead — upload a VP9 .webm here and this hero may fall back to the .mp4 or just the poster image.",
    hidden: showFor("sanity"),
    name: "webm",
    options: { accept: "video/webm" },
    title: "Video For Computers",
    type: "file",
  }),
  defineField({
    description: "The .mp4 file. Macs, iPhones and iPads need this one.",
    hidden: showFor("sanity"),
    name: "hevc",
    options: { accept: "video/mp4" },
    title: "Video For Apple Devices",
    type: "file",
  }),
  defineField({
    description:
      "A smaller .webm, so phones do not have to download the big file. AV1, like the one above.",
    hidden: showFor("sanity"),
    name: "mobileWebm",
    options: { accept: "video/webm" },
    title: "Video For Phones",
    type: "file",
  }),
  defineField({
    description:
      "Optional. Shown while the video loads, or on its own if you add no video.",
    name: "poster",
    title: "Picture",
    type: "image",
  }),
];

/**
 * Flags the one mistake the toggle makes possible: content uploaded to the
 * path that is not selected. Silent otherwise — a picture with no video at all
 * is a valid background.
 */
const checkVariant = (value: unknown): true | string => {
  const variant = value as HeroVariantValue | undefined;
  if (!variant) {
    return true;
  }
  const type = selected(variant);
  if (type !== "sanity" && !variant.mux?.asset && hasFiles(variant)) {
    return "Set to Mux, but only uploaded files are here. Upload a Mux video, or switch the source to Sanity.";
  }
  if (type === "sanity" && !hasFiles(variant) && variant.mux?.asset) {
    return "Set to Sanity, but only a Mux video is here. Upload the files, or switch the source to Mux.";
  }
  return true;
};

export const heroVideoField = defineField({
  description: "Add a video. If you have no video, add a picture instead.",
  fields: [
    defineField({
      description: "Shown in light mode.",
      fields: videoVariantFields(),
      name: "light",
      options: { collapsed: false, collapsible: true },
      title: "Light Mode",
      type: "object",
      validation: (Rule) => Rule.custom(checkVariant).warning(),
    }),
    defineField({
      description: "Optional. Leave empty to reuse the light mode background.",
      fields: videoVariantFields(),
      name: "dark",
      options: { collapsed: false, collapsible: true },
      title: "Dark Mode",
      type: "object",
      validation: (Rule) => Rule.custom(checkVariant).warning(),
    }),
  ],
  name: "video",
  options: { collapsed: true, collapsible: true },
  title: "Background",
  type: "object",
});

export const heroSchema = defineType({
  fields: [
    defineField({
      description:
        "Optional badge text displayed above the title, useful for highlighting new features or promotions",
      name: "badge",
      title: "Badge",
      type: "string",
    }),
    defineField({
      description:
        "The main heading text for the hero section that captures attention",
      name: "title",
      title: "Title",
      type: "string",
    }),
    definePortableTextField(["block"], {
      description:
        "The supporting paragraph shown beneath the title, introducing the page in a sentence or two",
      name: "richText",
    }),
    heroVideoField,
    buttonsField,
  ],
  icon: Star,
  name: "hero",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "Hero Block",
      title,
    }),
    select: {
      title: "title",
    },
  },
  title: "Hero",
  type: "object",
});
