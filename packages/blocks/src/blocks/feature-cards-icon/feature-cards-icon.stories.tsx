import type { Meta, StoryObj } from "@storybook/react";

import { paragraph } from "../../testing/fixtures";
import { FeatureCardsWithIcon } from "./feature-cards-icon";

const meta = {
  args: {
    cards: [
      {
        _key: "card-1",
        icon: "globe",
        richText: paragraph(
          "The proxy selects the site from the hostname and the locale from the URL path without querying Sanity."
        ),
        title: "Host-based routing",
      },
      {
        _key: "card-2",
        icon: "languages",
        richText: paragraph(
          "Each translated page has its own slug. Page metadata includes hreflang links to its translations."
        ),
        title: "Document-level localization",
      },
      {
        _key: "card-3",
        icon: "shield-check",
        richText: paragraph(
          "The app sets security headers and includes configurable Sentry, Google Analytics, and Vercel analytics integrations."
        ),
        title: "Headers and monitoring",
      },
    ],
    eyebrow: "Configuration",
    richText: paragraph("Each site uses the same routing and rendering code."),
    title: "How the sites share one app",
  },
  component: FeatureCardsWithIcon,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Feature Cards (Icon)",
} satisfies Meta<typeof FeatureCardsWithIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
