import type { Meta, StoryObj } from "@storybook/react";

import { buttons, MUX_SAMPLE, paragraph } from "../internal/testing/fixtures";
import { HeroBlock } from "./hero-block";

const meta = {
  args: {
    badge: "New in v0.1",
    buttons,
    isFirst: true,
    richText: paragraph(
      "One codebase, one Studio, any number of sites and locales. Every block you see here is shared between Storybook, the Studio preview and the site."
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
