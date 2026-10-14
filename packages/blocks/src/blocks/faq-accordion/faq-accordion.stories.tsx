import type { Meta, StoryObj } from "@storybook/react";

import { paragraph } from "../../testing/fixtures";
import { FaqAccordion } from "./faq-accordion";

const meta = {
  args: {
    categories: [
      {
        _key: "general",
        faqs: [
          {
            _id: "faq-1",
            richText: paragraph(
              "Each entry in sites.ts defines a site and creates a Studio workspace. The example configuration has two sites."
            ),
            title: "How many sites can one project serve?",
          },
          {
            _id: "faq-2",
            richText: paragraph(
              "Yes. Each site selects its languages in sites.ts. Its default language has no URL prefix. Other languages use a locale prefix."
            ),
            title: "Can two sites share a locale?",
          },
        ],
        title: "General",
      },
      {
        _key: "editing",
        faqs: [
          {
            _id: "faq-3",
            richText: paragraph(
              "Presentation opens the site that owns the document, with click-to-edit overlays on every block."
            ),
            title: "Does Visual Editing work per site?",
          },
        ],
        title: "Editing",
      },
    ],
    eyebrow: "FAQ",
    link: {
      description: "The README lists the local setup steps.",
      href: "https://github.com",
      openInNewTab: true,
      title: "Read the docs",
    },
    subtitle: "How sites, languages, and previews work in this template.",
    title: "Common setup questions",
  },
  component: FaqAccordion,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/FAQ Accordion",
} satisfies Meta<typeof FaqAccordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleCategory: Story = {
  args: {
    categories: meta.args.categories.slice(0, 1),
    link: null,
  },
};
