import type { Meta, StoryObj } from "@storybook/react";

import { buttons, MUX_SAMPLE, paragraph } from "../../testing/fixtures";
import { HeroBlock } from "./hero";

const meta = {
  args: {
    badge: "Sanity Forge",
    buttons,
    isFirst: true,
    richText: paragraph(
      "Brand A serves English, German, and French. Brand B serves English and German. Both use the same page blocks and Sanity dataset."
    ),
    title: "Multi-site, multilingual Sanity + Next.js",
  },
  component: HeroBlock,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Hero",
} satisfies Meta<typeof HeroBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutButtons: Story = {
  args: { badge: null, buttons: null },
};

export const WithMuxVideo: Story = {
  args: {
    video: {
      dark: { mediaType: "mux", mux: MUX_SAMPLE },
      light: { mediaType: "mux", mux: MUX_SAMPLE },
    },
  },
};
