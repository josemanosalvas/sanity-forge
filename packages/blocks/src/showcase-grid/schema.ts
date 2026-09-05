import { Image, Images } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField } from "../internal/schema-fields";

const showcaseItem = defineArrayMember({
  fields: [
    defineField({
      description:
        "The name of the site, shown as the label beneath its screenshot (for example: 'Acme Store').",
      name: "siteName",
      title: "Site Name",
      type: "string",
      validation: (Rule) => Rule.required().error("A site name is required"),
    }),
    defineField({
      description:
        "The live site's full web address, including https://. When set, the whole card links out to it (opens in a new tab). Leave empty for a display-only card.",
      name: "url",
      title: "URL",
      type: "url",
    }),
    defineField({
      description:
        "A short label shown on the right of the card (for example: 'Real Estate', 'Portfolio', 'Intelligence Software').",
      name: "category",
      title: "Category",
      type: "string",
    }),
    imageWithAltField({
      description:
        "A screenshot of the site's homepage — the main image on the card. Use a 16:9 image for the cleanest crop.",
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
        "Show this site as a large banner at the top of the section. Each site marked here becomes its own banner.",
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
    "A section that shows off real websites built with the template. Add the sites as items below — the one marked 'Featured' is shown in the large card at the top.",
  fields: [
    defineField({
      description:
        "The large heading at the top of the section (for example: 'Sites built with this starter').",
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      description:
        "The short paragraph under the title that sets up what the showcase is about.",
      name: "description",
      rows: 3,
      title: "Description",
      type: "text",
    }),
    defineField({
      description:
        "The sites shown in the grid. Drag to reorder — visitors see them in this order. Mark one as Featured to give it the large banner; if you don't mark any, the first item gets the banner automatically. Add a URL to make a card link out to its live site.",
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
