import type { Meta, StoryObj } from "@storybook/react";

import { paragraph } from "../internal/testing/fixtures";
import { FaqAccordion } from "./component";

const meta = {
  title: "blocks/FAQ Accordion",
  component: FaqAccordion,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "FAQ",
    title: "Questions, answered",
    subtitle:
      "Everything editors and developers ask before their first deploy.",
    link: {
      title: "Read the docs",
      description: "The full setup guide lives in the README.",
      href: "https://github.com",
      openInNewTab: true,
    },
    categories: [
      {
        _key: "general",
        title: "General",
        faqs: [
          {
            _id: "faq-1",
            title: "How many sites can one project serve?",
            richText: paragraph(
              "As many as you register. Each site is a key in the host registry and gets its own Studio workspace."
            ),
          },
          {
            _id: "faq-2",
            title: "Can two sites share a locale?",
            richText: paragraph(
              "Yes. Locales are orthogonal to sites; the default locale is unprefixed and the rest carry a prefix."
            ),
          },
        ],
      },
      {
        _key: "editing",
        title: "Editing",
        faqs: [
          {
            _id: "faq-3",
            title: "Does Visual Editing work per site?",
            richText: paragraph(
              "Presentation opens the site that owns the document, with click-to-edit overlays on every block."
            ),
          },
        ],
      },
    ],
  },
} satisfies Meta<typeof FaqAccordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleCategory: Story = {
  args: {
    link: null,
    categories: meta.args.categories.slice(0, 1),
  },
};
