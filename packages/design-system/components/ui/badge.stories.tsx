import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

/**
 * Displays a badge or a component that looks like a badge.
 */
const meta = {
  argTypes: {
    children: {
      control: "text",
    },
  },
  args: {
    children: "Badge",
  },
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Badge",
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the badge. */
export const Default: Story = {};

/** Use `secondary` for less urgent information. */
export const Secondary: Story = {
  args: { variant: "secondary" },
};

/** Use `destructive` to indicate errors or alerts. */
export const Destructive: Story = {
  args: { variant: "destructive" },
};

/** Use `outline` for subtle, low-emphasis labels. */
export const Outline: Story = {
  args: { variant: "outline" },
};
