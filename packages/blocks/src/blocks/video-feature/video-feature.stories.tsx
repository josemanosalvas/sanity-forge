import type { Meta, StoryObj } from "@storybook/react";

import { MUX_SAMPLE, paragraph } from "../../testing/fixtures";
import { VideoFeature } from "./video-feature";

const meta = {
  args: {
    caption: "Public sample clip from Mux.",
    eyebrow: "Video example",
    richText: paragraph("Select the play button to load the Mux player."),
    title: "Mux video playback",
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
