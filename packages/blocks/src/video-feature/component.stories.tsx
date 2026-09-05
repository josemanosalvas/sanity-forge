import type { Meta, StoryObj } from "@storybook/react";

import { MUX_SAMPLE, paragraph } from "../internal/testing/fixtures";
import { VideoFeature } from "./component";

const meta = {
  args: {
    caption: "Recorded on the demo dataset.",
    eyebrow: "Watch",
    richText: paragraph(
      "Click any block on the site to jump to its field in the Studio."
    ),
    title: "Editing a page in Presentation",
    video: { asset: MUX_SAMPLE, autoPlay: false, loop: false },
  },
  component: VideoFeature,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Video Feature",
} satisfies Meta<typeof VideoFeature>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutVideo: Story = {
  args: { video: null },
};
