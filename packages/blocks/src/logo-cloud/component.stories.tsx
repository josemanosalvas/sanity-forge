import type { Meta, StoryObj } from "@storybook/react";

import { placeholderImage } from "../internal/testing/fixtures";
import { LogoCloud } from "./component";

const meta = {
  args: {
    logos: [1, 2, 3, 4, 5, 6].map((seed) => ({
      _key: `logo-${seed}`,
      href: seed % 2 ? "https://example.com" : null,
      image: placeholderImage(seed, {
        alt: `Customer ${seed}`,
        height: 80,
        width: seed % 2 ? 320 : 120,
      }),
      openInNewTab: true,
    })),
  },
  component: LogoCloud,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Logo Cloud",
} satisfies Meta<typeof LogoCloud>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
