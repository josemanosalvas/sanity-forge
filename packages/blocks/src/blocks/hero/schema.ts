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
