import type { Meta, StoryObj } from "@storybook/react";

import { SocialGrid } from "./component";

const meta = {
  title: "blocks/Social Grid",
  component: SocialGrid,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Community",
    title: "Follow along",
    subtitle: "Release notes, office hours and the occasional launch.",
    socials: [
      {
        _key: "s1",
        platform: "github",
        label: "GitHub",
        href: "https://github.com",
        openInNewTab: true,
      },
      {
        _key: "s2",
        platform: "youtube",
        label: "YouTube",
        href: "https://youtube.com",
        openInNewTab: true,
      },
      {
        _key: "s3",
        platform: "linkedin",
        label: "LinkedIn",
        href: "https://linkedin.com",
        openInNewTab: true,
      },
      {
        _key: "s4",
        platform: "reddit",
        label: "Reddit",
        href: "https://reddit.com",
        openInNewTab: true,
      },
    ],
  },
} satisfies Meta<typeof SocialGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
