import type { Meta, StoryObj } from "@storybook/react";

import { MUX_SAMPLE, paragraph } from "../internal/testing/fixtures";
import { VideoFeature } from "./component";

const meta = {
  title: "blocks/Video Feature",
  component: VideoFeature,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Watch",
    title: "Editing a page in Presentation",
    richText: paragraph(
      "Click any block on the site to jump to its field in the Studio."
    ),
    caption: "Recorded on the demo dataset.",
    video: { asset: MUX_SAMPLE, autoPlay: false, loop: false },
  },
} satisfies Meta<typeof VideoFeature>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutVideo: Story = {
  args: { video: null },
};
