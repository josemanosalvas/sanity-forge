import type { Meta, StoryObj } from "@storybook/react";

import {
  buttons,
  paragraph,
  placeholderImage,
} from "../internal/testing/fixtures";
import { CTABlock } from "./component";

const meta = {
  title: "blocks/CTA",
  component: CTABlock,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Ready when you are",
    title: "Launch your next site on the Forge",
    richText: paragraph(
      "Clone the template, point it at a Sanity project and add a site to the registry. Everything else is already wired."
    ),
    buttons,
  },
} satisfies Meta<typeof CTABlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLogos: Story = {
  args: {
    usedByTeams: {
      title: "Trusted by teams shipping every week",
      logos: [1, 2, 3, 4].map((seed) => ({
        _key: `logo-${seed}`,
        image: placeholderImage(seed, {
          width: 240,
          height: 80,
          alt: `Team ${seed}`,
        }),
        href: "https://example.com",
      })),
    },
  },
};
