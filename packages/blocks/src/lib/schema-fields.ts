import { Images } from "lucide-react";
import { defineArrayMember, defineField } from "sanity";
import type {
  ConditionalProperty,
  ImageRule,
  ImageValue,
  ObjectRule,
  Rule,
  ValidationBuilder,
} from "sanity";

export { definePortableTextField } from "./sanity-rich-text";

export const buttonsField = defineField({
  description:
    "Add one or more clickable buttons that visitors can use to navigate your website",
  name: "buttons",
  of: [defineArrayMember({ type: "button" })],
  type: "array",
});

export const iconField = defineField({
  description:
    "Choose a small picture symbol to represent this item, like a home icon or shopping cart",
  name: "icon",
  title: "Icon",
  type: "lucide-icon",
});

interface Props {
  description?: string;
  group?: string;
  name?: string;
  title?: string;
  validation?: ValidationBuilder<ImageRule, ImageValue>;
}

export const imageWithAltField = ({
  description = "An image, make sure to add an alt text and use the hotspot tool to ensure if image is cropped it highlights the focus point",
  group,
  name = "image",
  title = "Image",
  validation,
}: Props = {}) =>
  defineField({
    description,
    fields: [
      defineField({
        description:
          "The text that describes the image for screen readers and search engines",
        name: "alt",
        title: "Alt Text",
        type: "string",
        validation: (Rule) =>
          Rule.custom((value, context) => {
            const parent = context.parent as { asset?: unknown };
            return parent?.asset && !value?.trim()
              ? "Alt text is required when an image is set"
              : true;
          }),
      }),
    ],
    group,
    name,
    options: {
      hotspot: true,
    },
    title,
    type: "image",
    validation,
  });

export const logoLinkItem = (name: string) =>
  defineArrayMember({
    fields: [
      imageWithAltField({
        description:
          "The partner or brand logo to display. Use a transparent PNG or SVG for the cleanest result",
        title: "Logo",
      }),
      defineField({
        description:
          "Optional link opened when a visitor clicks this logo, for example the brand's website",
        name: "url",
        title: "Link URL",
        type: "customUrl",
      }),
    ],
    icon: Images,
    name,
    preview: {
      prepare: ({ media, alt, externalUrl, internalUrl, urlType }) => {
        const url = urlType === "external" ? externalUrl : internalUrl;

        return {
          media,
          subtitle: url || "No link",
          title: alt || "Logo",
        };
      },
      select: {
        alt: "image.alt",
        externalUrl: "url.external",
        internalUrl: "url.internal.slug.current",
        media: "image",
        urlType: "url.type",
      },
    },
    type: "object",
  });

export const muxVideoField = ({
  description = "Upload a file, paste a video URL, or pick one already in the project.",
  group,
  hidden,
  name = "video",
  title = "Video",
  validation,
}: {
  description?: string;
  group?: string;
  /** For blocks that offer a choice of delivery — see the hero's `mediaType`. */
  hidden?: ConditionalProperty;
  name?: string;
  title?: string;
  validation?: ValidationBuilder<Rule>;
} = {}) =>
  defineField({
    description,
    group,
    hidden,
    name,
    options: { collapsible: false },
    title,
    type: "mux.video",
    validation,
  });

/** Use muxVideoField for backgrounds; this embed adds playback controls. */
export const muxVideoEmbedField = ({
  description = "The video for this section, and how it plays.",
  group,
  name = "video",
  title = "Video",
  validation,
}: {
  description?: string;
  group?: string;
  name?: string;
  title?: string;
  validation?: ValidationBuilder<ObjectRule, Record<string, unknown>>;
} = {}) =>
  defineField({
    description,
    fields: [
      muxVideoField({
        name: "asset",
        title: "File",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        description:
          "Starts the video without sound as soon as the page loads. Leave it off and visitors see the opening frame with a play button.",
        initialValue: false,
        name: "autoPlay",
        title: "Play automatically",
        type: "boolean",
      }),
      defineField({
        description: "Starts again from the beginning when it reaches the end.",
        initialValue: false,
        name: "loop",
        title: "Repeat",
        type: "boolean",
      }),
    ],
    group,
    name,
    options: { collapsible: false },
    title,
    type: "object",
    validation,
  });
