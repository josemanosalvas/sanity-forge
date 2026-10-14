import { Image, Images } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField } from "../../lib/schema-fields";

const showcaseItem = defineArrayMember({
  fields: [
    defineField({
      description: "Site name displayed below the screenshot.",
      name: "siteName",
      title: "Site Name",
      type: "string",
      validation: (Rule) => Rule.required().error("A site name is required"),
    }),
    defineField({
      description:
        "Full site URL, including https://. The card opens it in a new tab. Leave empty for a card without a link.",
      name: "url",
      title: "URL",
      type: "url",
    }),
    defineField({
      description:
        "Short label on the right of the card, such as the site category.",
      name: "category",
      title: "Category",
      type: "string",
    }),
    imageWithAltField({
      description:
        "Main card image. Use a 16:9 screenshot to match the card dimensions.",
      name: "screenshot",
      title: "Screenshot",
    }),
    imageWithAltField({
      description:
        "Optional small logo or mark for the site, shown next to its name. Leave empty to fall back to the site's initials.",
      name: "attributionLogo",
      title: "Logo",
    }),
    defineField({
      description:
        "Display this item as a large banner. The first banner appears above the grid, and later banners appear below it.",
      initialValue: false,
      name: "featured",
      title: "Featured",
      type: "boolean",
    }),
  ],
  icon: Image,
  name: "showcaseItem",
  preview: {
    prepare: ({ title, subtitle, media }) => ({
      media,
      subtitle: subtitle || "Showcase item",
      title: title || "Untitled site",
    }),
    select: {
      media: "screenshot",
      subtitle: "url",
      title: "siteName",
    },
  },
  type: "object",
});

export const showcaseGridSchema = defineType({
  description:
    "A grid of linked images with names and categories. Featured items appear as large banners.",
  fields: [
    defineField({
      description: "Heading above the grid.",
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      description: "Paragraph below the title.",
      name: "description",
      rows: 3,
      title: "Description",
      type: "text",
    }),
    defineField({
      description:
        "Drag to change item order. Featured items become banners, with the first above the grid and the rest below. Without a featured item, the first item becomes the banner. Items with a URL link to that address.",
      name: "items",
      of: [showcaseItem],
      title: "Showcase Items",
      type: "array",
    }),
  ],
  icon: Images,
  name: "showcaseGrid",
  preview: {
    prepare: ({ title, items = [] }) => {
      const count = items.length;
      const label = count === 1 ? "site" : "sites";
      return {
        subtitle: `${count} ${label}`,
        title: title || "Showcase Grid",
      };
    },
    select: {
      items: "items",
      title: "title",
    },
  },
  title: "Showcase Grid",
  type: "object",
});
