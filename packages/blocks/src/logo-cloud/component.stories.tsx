import type { Meta, StoryObj } from "@storybook/react";

import { placeholderImage } from "../internal/testing/fixtures";
import { LogoCloud } from "./component";

const meta = {
  title: "blocks/Logo Cloud",
  component: LogoCloud,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    logos: [1, 2, 3, 4, 5, 6].map((seed) => ({
      _key: `logo-${seed}`,
      image: placeholderImage(seed, {
        width: seed % 2 ? 320 : 120,
        height: 80,
        alt: `Customer ${seed}`,
      }),
      href: seed % 2 ? "https://example.com" : null,
      openInNewTab: true,
    })),
  },
} satisfies Meta<typeof LogoCloud>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
