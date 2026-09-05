import type { Meta, StoryObj } from "@storybook/react";

import { SocialGrid } from "./social-grid";

const meta = {
  args: {
    eyebrow: "Community",
    socials: [
      {
        _key: "s1",
        href: "https://github.com",
        label: "GitHub",
        openInNewTab: true,
        platform: "github",
      },
      {
        _key: "s2",
        href: "https://youtube.com",
        label: "YouTube",
        openInNewTab: true,
        platform: "youtube",
      },
      {
        _key: "s3",
        href: "https://linkedin.com",
        label: "LinkedIn",
        openInNewTab: true,
        platform: "linkedin",
      },
      {
        _key: "s4",
        href: "https://reddit.com",
        label: "Reddit",
        openInNewTab: true,
        platform: "reddit",
      },
    ],
    subtitle: "Release notes, office hours and the occasional launch.",
    title: "Follow along",
  },
  component: SocialGrid,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Social Grid",
} satisfies Meta<typeof SocialGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
