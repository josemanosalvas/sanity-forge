import type { Meta, StoryObj } from "@storybook/react";

import { paragraph } from "../internal/testing/fixtures";
import { FaqAccordion } from "./component";

const meta = {
  args: {
    categories: [
      {
        _key: "general",
        faqs: [
          {
            _id: "faq-1",
            richText: paragraph(
              "As many as you register. Each site is a key in the host registry and gets its own Studio workspace."
            ),
            title: "How many sites can one project serve?",
          },
          {
            _id: "faq-2",
            richText: paragraph(
              "Yes. Locales are orthogonal to sites; the default locale is unprefixed and the rest carry a prefix."
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
      description: "The full setup guide lives in the README.",
      href: "https://github.com",
      openInNewTab: true,
      title: "Read the docs",
    },
    subtitle:
      "Everything editors and developers ask before their first deploy.",
    title: "Questions, answered",
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
