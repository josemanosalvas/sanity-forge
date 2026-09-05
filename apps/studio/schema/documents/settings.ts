import { Cog } from "lucide-react";
import { defineField, defineType } from "sanity";

import { imageWithAltField, siteField } from "../fields";

const socialLinks = defineField({
  name: "socialLinks",
  type: "object",
  title: "Social Media Links",
  description: "Add links to your social media profiles",
  fields: [
    defineField({ name: "linkedin", type: "string", title: "LinkedIn URL" }),
    defineField({ name: "facebook", type: "string", title: "Facebook URL" }),
    defineField({ name: "twitter", type: "string", title: "Twitter/X URL" }),
    defineField({ name: "instagram", type: "string", title: "Instagram URL" }),
    defineField({ name: "youtube", type: "string", title: "YouTube URL" }),
    defineField({ name: "reddit", type: "string", title: "Reddit URL" }),
  ],
});

/**
 * One document per site. The few translatable strings use field-level
 * localization (internationalized arrays) because they are published
 * together with the rest of the site's settings.
 */
export const settings = defineType({
  name: "settings",
  type: "document",
  title: "Site Settings",
  description: "Global settings and configuration for one site",
  icon: Cog,
  fields: [
    siteField,
    defineField({
      name: "siteTitle",
      type: "internationalizedArrayString",
      title: "Site Title",
      description: "The main title of the site, used in browser tabs and SEO",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "siteDescription",
      type: "internationalizedArrayText",
      title: "Site Description",
      description: "A brief description of the site for SEO purposes",
    }),
    defineField({
      name: "logos",
      type: "object",
      title: "Logos",
      description: "The logo variants used across the site",
      options: { collapsible: true, collapsed: false },
      fields: [
        imageWithAltField({
          name: "logo",
          title: "Logo (Light Mode)",
          description:
            "The site logo shown on light backgrounds, such as the navbar in light mode. Its alt text is reused for the other logo variants.",
        }),
        defineField({
          name: "logoDark",
          type: "image",
          title: "Logo (Dark Mode)",
          description:
            "Optional logo variant for dark backgrounds. Reuses the light logo's alt text; if left empty, the light logo is used everywhere.",
          options: { hotspot: true },
        }),
        defineField({
          name: "footerLogo",
          type: "image",
          title: "Footer Logo",
          description:
            "Optional logo for the footer, where the main logo may not have enough contrast. If left empty, the main logo is used.",
          options: { hotspot: true },
        }),
      ],
    }),
    defineField({
      name: "favicon",
      type: "object",
      title: "Favicon",
      description:
        "The small icon shown in browser tabs and bookmarks. Add both formats or neither — each browser reads only one of them.",
      options: { collapsible: true, collapsed: false },
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
            ? "Add an ICO too — Safari cannot render an SVG favicon and would keep the built-in one"
            : "Add an SVG too — every other browser prefers it and would keep the built-in one";
        }),
      fields: [
        defineField({
          name: "svg",
          type: "image",
          title: "SVG",
          description:
            "Stays sharp at every size and can adapt to dark mode. Chrome, Firefox and Edge use this; Safari ignores it.",
          options: { accept: "image/svg+xml" },
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
          name: "ico",
          type: "file",
          title: "ICO",
          description:
            "The universal fallback every browser reads, Safari included. Should hold 16, 32 and 48px icons.",
          options: { accept: "image/vnd.microsoft.icon,.ico" },
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
    }),
    defineField({
      name: "ogImage",
      type: "image",
      title: "Default Social Share Image",
      description:
        "The fallback image shown when a page is shared on social media. Used whenever a page has no SEO image of its own. Recommended size 1200×630.",
      options: { hotspot: true },
    }),
    defineField({
      name: "contactEmail",
      type: "string",
      title: "Contact Email",
      description: "Primary contact email address for the site",
      validation: (rule) => rule.email(),
    }),
    socialLinks,
  ],
  preview: {
    select: {
      site: "site",
      title: "siteTitle.0.value",
    },
    prepare: ({ site, title }) => ({
      title: title || "Site settings",
      subtitle: site,
      media: Cog,
    }),
  },
});
