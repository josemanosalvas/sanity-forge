import { Play } from "lucide-react";
import { defineField, defineType } from "sanity";

import {
  definePortableTextField,
  muxVideoEmbedField,
} from "../internal/schema-fields";

export const videoFeatureSchema = defineType({
  fields: [
    defineField({
      description:
        "The smaller text that sits above the title to provide context",
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      description: "The large text shown above the video",
      name: "title",
      title: "Title",
      type: "string",
    }),
    definePortableTextField(["block"], {
      description: "The supporting paragraph shown beneath the title",
      name: "richText",
    }),
    muxVideoEmbedField({
      // The block is the video: without one there is nothing to show but a
      // heading, so this blocks publishing rather than warning. The renderer
      // still copes with an absent clip — a published asset can be deleted, or
      // its encode can fail, long after the form was satisfied.
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      description: "Optional line of text shown underneath the video",
      name: "caption",
      title: "Caption",
      type: "string",
    }),
  ],
  icon: Play,
  name: "videoFeature",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "Video Block",
      title: title || "Video",
    }),
    select: {
      title: "title",
    },
  },
  title: "Video",
  type: "object",
});
