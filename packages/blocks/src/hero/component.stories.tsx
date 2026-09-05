import type { Meta, StoryObj } from "@storybook/react";

import { buttons, MUX_SAMPLE, paragraph } from "../internal/testing/fixtures";
import { HeroBlock } from "./component";

const meta = {
  title: "blocks/Hero",
  component: HeroBlock,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    badge: "New in v0.1",
    title: "Multi-site, multilingual Sanity + Next.js",
    richText: paragraph(
      "One codebase, one Studio, any number of sites and locales. Every block you see here is shared between Storybook, the Studio preview and the site."
    ),
    buttons,
    isFirst: true,
  },
} satisfies Meta<typeof HeroBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutButtons: Story = {
  args: { buttons: null, badge: null },
};

export const WithMuxVideo: Story = {
  args: {
    video: {
      light: { mediaType: "mux", mux: MUX_SAMPLE },
      dark: { mediaType: "mux", mux: MUX_SAMPLE },
    },
  },
};
