import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

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

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Destructive: Story = {
  args: { variant: "destructive" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};
