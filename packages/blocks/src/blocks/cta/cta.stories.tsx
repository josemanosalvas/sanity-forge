import type { Meta, StoryObj } from "@storybook/react";

import { buttons, paragraph, placeholderImage } from "../../testing/fixtures";
import { CTABlock } from "./cta";

const meta = {
  args: {
    buttons,
    eyebrow: "Setup",
    richText: paragraph(
      "Set the Sanity project and dataset in the environment files, then configure the site domains in sites.ts."
    ),
    title: "Configure your first site",
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
      title: "Example partner logos",
    },
  },
};
