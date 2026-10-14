import { Star } from "lucide-react";
import { defineField, defineType } from "sanity";
import type { ValidationContext } from "sanity";

import { SANITY_API_VERSION } from "../../lib/sanity-api-version";
import {
  buttonsField,
  definePortableTextField,
  muxVideoField,
} from "../../lib/schema-fields";

export const HERO_MEDIA_TYPES = ["mux", "mux-mp4", "sanity"] as const;

interface HeroVariantValue {
  mediaType?: string;
  mux?: { asset?: { _ref?: string } | null } | null;
  webm?: unknown;
  hevc?: unknown;
  mobileWebm?: unknown;
}

const hasFiles = (variant?: HeroVariantValue) =>
  Boolean(variant?.webm || variant?.hevc || variant?.mobileWebm);

/** Infer legacy media selection consistently with the renderer. */
const selected = (
  variant?: HeroVariantValue
): (typeof HERO_MEDIA_TYPES)[number] => {
  const type = variant?.mediaType;
  if (type === "sanity" || type === "mux-mp4" || type === "mux") {
    return type;
  }
  // The Studio sees the reference; the renderer also checks the playback ID.
  return variant?.mux?.asset ? "mux" : "sanity";
};

const showFor =
  (...types: readonly string[]) =>
  (context: { parent?: unknown }) =>
    !types.includes(selected(context.parent as HeroVariantValue));

const videoVariantFields = () => [
  defineField({
    description:
      "Choose the video provider. Mux encodes the uploaded video. Sanity serves the encoded files you upload below.",
    initialValue: "sanity",
    name: "mediaType",
    options: {
      layout: "radio",
      list: [
        {
          title: "Mux adaptive streaming",
          value: "mux",
        },
        {
          title: "Mux MP4 file",
          value: "mux-mp4",
        },
        { title: "Sanity uploaded files", value: "sanity" },
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
      "Upload an AV1-encoded .webm file. The player declares AV1 to the browser. A VP9 file may fail to play, leaving the MP4 fallback or poster visible.",
    hidden: showFor("sanity"),
    name: "webm",
    options: { accept: "video/webm" },
    title: "Video For Computers",
    type: "file",
  }),
  defineField({
    description: "Upload an HEVC-encoded .mp4 file for Safari playback.",
    hidden: showFor("sanity"),
    name: "hevc",
    options: { accept: "video/mp4" },
    title: "Video For Apple Devices",
    type: "file",
  }),
  defineField({
    description:
      "Upload a smaller AV1-encoded .webm file for narrow screens and slow connections.",
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

/** What the renderer's `muxPlaybackId` (`lib/mux.ts`) checks before it plays. */
const muxAssetQuery = `*[_id == $id][0]{
  status,
  "policy": data.playback_ids[0].policy
}`;

interface MuxAssetState {
  status?: string | null;
  policy?: string | null;
}

/**
 * Warn about inactive uploads and Mux assets the renderer cannot play.
 * A poster without video is valid.
 */
export const validateHeroVariant = async (
  value: unknown,
  { getClient }: Pick<ValidationContext, "getClient">
): Promise<true | string> => {
  const variant = value as HeroVariantValue | undefined;
  if (!variant) {
    return true;
  }
  const type = selected(variant);
  const ref = variant.mux?.asset?._ref;
  if (type !== "sanity" && !ref && hasFiles(variant)) {
    return "Set to Mux, but only uploaded files are here. Upload a Mux video, or switch the source to Sanity.";
  }
  if (type === "sanity" && !hasFiles(variant) && ref) {
    return "Set to Sanity, but only a Mux video is here. Upload the files, or switch the source to Mux.";
  }
  if (type === "sanity" || !ref) {
    return true;
  }
  const asset = await getClient({
    apiVersion: SANITY_API_VERSION,
  }).fetch<MuxAssetState | null>(muxAssetQuery, { id: ref });
  if (!asset) {
    // A dangling reference is the Studio's own warning to give.
    return true;
  }
  if (asset.status === "errored") {
    return "Mux could not process this video, so the site shows the uploaded files or the picture instead. Upload it again, or switch the source to Sanity.";
  }
  if (!asset.policy) {
    return "Mux has not issued a playback ID for this video yet, so the site shows the uploaded files or the picture until it does.";
  }
  if (asset.policy !== "public") {
    return `This Mux video has a ${asset.policy} playback policy and the site only plays public ones. Upload it again with a public playback policy.`;
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
      validation: (Rule) => Rule.custom(validateHeroVariant).warning(),
    }),
    defineField({
      description: "Optional. Leave empty to reuse the light mode background.",
      fields: videoVariantFields(),
      name: "dark",
      options: { collapsed: false, collapsible: true },
      title: "Dark Mode",
      type: "object",
      validation: (Rule) => Rule.custom(validateHeroVariant).warning(),
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
      description: "Optional badge above the title.",
      name: "badge",
      title: "Badge",
      type: "string",
    }),
    defineField({
      description: "Main heading for the hero section.",
      name: "title",
      title: "Title",
      type: "string",
    }),
    definePortableTextField(["block"], {
      description: "Page introduction below the title.",
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
