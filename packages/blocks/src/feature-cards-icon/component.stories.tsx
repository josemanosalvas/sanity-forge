import type { Meta, StoryObj } from "@storybook/react";

import { paragraph } from "../internal/testing/fixtures";
import { FeatureCardsWithIcon } from "./component";

const meta = {
  title: "blocks/Feature Cards (Icon)",
  component: FeatureCardsWithIcon,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Why the Forge",
    title: "Built for teams that run more than one site",
    richText: paragraph("Three things every site gets on day one."),
    cards: [
      {
        _key: "card-1",
        icon: "globe",
        title: "Host-based routing",
        richText: paragraph(
          "Clean public URLs per site and locale, resolved in the proxy without a CMS round trip."
        ),
      },
      {
        _key: "card-2",
        icon: "languages",
        title: "Document-level localization",
        richText: paragraph(
          "Localized slugs, translation metadata and hreflang alternates out of the box."
        ),
      },
      {
        _key: "card-3",
        icon: "shield-check",
        title: "Production defaults",
        richText: paragraph(
          "Security headers, observability hooks and analytics you can swap out."
        ),
      },
    ],
  },
} satisfies Meta<typeof FeatureCardsWithIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
