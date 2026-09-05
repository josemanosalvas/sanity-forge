import { imageWithAltField } from "@repo/blocks/lib/schema-fields";
import { Cog } from "lucide-react";
import { defineField, defineType } from "sanity";

import { siteField } from "../fields/site";

const socialLinks = defineField({
  description: "Add links to your social media profiles",
  fields: [
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "string" }),
    defineField({ name: "facebook", title: "Facebook URL", type: "string" }),
    defineField({ name: "twitter", title: "Twitter/X URL", type: "string" }),
    defineField({ name: "instagram", title: "Instagram URL", type: "string" }),
    defineField({ name: "youtube", title: "YouTube URL", type: "string" }),
    defineField({ name: "reddit", title: "Reddit URL", type: "string" }),
  ],
  name: "socialLinks",
  title: "Social Media Links",
  type: "object",
});

/**
 * One document per site. The few translatable strings use field-level
 * localization (internationalized arrays) because they are published
 * together with the rest of the site's settings.
 */
export const settings = defineType({
  description: "Global settings and configuration for one site",
  fields: [
    siteField,
    defineField({
      description: "The main title of the site, used in browser tabs and SEO",
      name: "siteTitle",
      title: "Site Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "A brief description of the site for SEO purposes",
      name: "siteDescription",
      title: "Site Description",
      type: "internationalizedArrayText",
    }),
    defineField({
      description: "The logo variants used across the site",
      fields: [
        imageWithAltField({
          description:
            "The site logo shown on light backgrounds, such as the navbar in light mode. Its alt text is reused for the other logo variants.",
          name: "logo",
          title: "Logo (Light Mode)",
        }),
        defineField({
          description:
            "Optional logo variant for dark backgrounds. Reuses the light logo's alt text; if left empty, the light logo is used everywhere.",
          name: "logoDark",
          options: { hotspot: true },
          title: "Logo (Dark Mode)",
          type: "image",
        }),
        defineField({
          description:
            "Optional logo for the footer, where the main logo may not have enough contrast. If left empty, the main logo is used.",
          name: "footerLogo",
          options: { hotspot: true },
          title: "Footer Logo",
          type: "image",
        }),
      ],
      name: "logos",
      options: { collapsed: false, collapsible: true },
      title: "Logos",
      type: "object",
    }),
    defineField({
      description:
        "The small icon shown in browser tabs and bookmarks. Add both formats or neither — each browser reads only one of them.",
      fields: [
        defineField({
          description:
            "Stays sharp at every size and can adapt to dark mode. Chrome, Firefox and Edge use this; Safari ignores it.",
          name: "svg",
          options: { accept: "image/svg+xml" },
          title: "SVG",
          type: "image",
          validation: (rule) =>
            rule.custom((value) => {
              const ref = (value as { asset?: { _ref?: string } })?.asset?._ref;
              if (!ref) {
                return true;
              }
              return ref.split("-").pop() === "svg"
                ? true
                : "Must be an SVG file";
            }),
        }),
        defineField({
          description:
            "The universal fallback every browser reads, Safari included. Should hold 16, 32 and 48px icons.",
          name: "ico",
          options: { accept: "image/vnd.microsoft.icon,.ico" },
          title: "ICO",
          type: "file",
          validation: (rule) =>
            rule.custom((value) => {
              const ref = (value as { asset?: { _ref?: string } })?.asset?._ref;
              if (!ref) {
                return true;
              }
              return ref.split("-").pop() === "ico"
                ? true
                : "Must be an ICO file";
            }),
        }),
      ],
      name: "favicon",
      options: { collapsed: false, collapsible: true },
      title: "Favicon",
      type: "object",
      validation: (rule) =>
        rule.custom((value) => {
          const favicon = value as
            | { svg?: { asset?: unknown }; ico?: { asset?: unknown } }
            | undefined;
          const hasSvg = Boolean(favicon?.svg?.asset);
          const hasIco = Boolean(favicon?.ico?.asset);
          if (hasSvg === hasIco) {
            return true;
          }
          return hasSvg
            ? "Add an ICO too — Safari cannot render an SVG favicon and would show none"
            : "Add an SVG too — every other browser prefers it";
        }),
    }),
    defineField({
      description:
        "The fallback image shown when a page is shared on social media. Used whenever a page has no SEO image of its own. Recommended size 1200×630.",
      name: "ogImage",
      options: { hotspot: true },
      title: "Default Social Share Image",
      type: "image",
    }),
    defineField({
      description: "Primary contact email address for the site",
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    socialLinks,
  ],
  icon: Cog,
  name: "settings",
  preview: {
    prepare: ({ site, title }) => ({
      media: Cog,
      subtitle: site,
      title: title || "Site settings",
    }),
    select: {
      site: "site",
      title: "siteTitle.0.value",
    },
  },
  title: "Site Settings",
  type: "document",
});
