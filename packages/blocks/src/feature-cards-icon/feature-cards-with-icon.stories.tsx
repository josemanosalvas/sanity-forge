import type { Meta, StoryObj } from "@storybook/react";

import { paragraph } from "../testing/fixtures";
import { FeatureCardsWithIcon } from "./feature-cards-with-icon";

const meta = {
  args: {
    cards: [
      {
        _key: "card-1",
        icon: "globe",
        richText: paragraph(
          "Clean public URLs per site and locale, resolved in the proxy without a CMS round trip."
        ),
        title: "Host-based routing",
      },
      {
        _key: "card-2",
        icon: "languages",
        richText: paragraph(
          "Localized slugs, translation metadata and hreflang alternates out of the box."
        ),
        title: "Document-level localization",
      },
      {
        _key: "card-3",
        icon: "shield-check",
        richText: paragraph(
          "Security headers, observability hooks and analytics you can swap out."
        ),
        title: "Production defaults",
      },
    ],
    eyebrow: "Why the Forge",
    richText: paragraph("Three things every site gets on day one."),
    title: "Built for teams that run more than one site",
  },
  component: FeatureCardsWithIcon,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Feature Cards (Icon)",
} satisfies Meta<typeof FeatureCardsWithIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
