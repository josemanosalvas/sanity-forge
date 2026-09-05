import type { Meta, StoryObj } from "@storybook/react";

import { buttons, paragraph, placeholderImage } from "../testing/fixtures";
import { CTABlock } from "./cta-block";

const meta = {
  args: {
    buttons,
    eyebrow: "Ready when you are",
    richText: paragraph(
      "Clone the template, point it at a Sanity project and add a site to the registry. Everything else is already wired."
    ),
    title: "Launch your next site on the Forge",
  },
  component: CTABlock,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/CTA",
} satisfies Meta<typeof CTABlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLogos: Story = {
  args: {
    usedByTeams: {
      logos: [1, 2, 3, 4].map((seed) => ({
        _key: `logo-${seed}`,
        href: "https://example.com",
        image: placeholderImage(seed, {
          alt: `Team ${seed}`,
          height: 80,
          width: 240,
        }),
      })),
      title: "Trusted by teams shipping every week",
    },
  },
};
