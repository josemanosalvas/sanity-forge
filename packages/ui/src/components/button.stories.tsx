import type { Meta, StoryObj } from "@storybook/react";
import { Loader2, Mail } from "lucide-react";

import { Button } from "./button";

const meta = {
  argTypes: {
    children: {
      control: "text",
    },
    size: {
      control: { type: "select" },
      options: [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ],
    },
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
    },
  },
  args: {
    children: "Button",
    size: "default",
    variant: "default",
  },
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Button",
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Destructive: Story = {
  args: { variant: "destructive" },
};

export const Link: Story = {
  args: { variant: "link" },
};

export const Loading: Story = {
  args: {
    ...Outline.args,
    disabled: true,
  },
  render: (args) => (
    <Button {...args}>
      <Loader2 className="animate-spin" />
      Button
    </Button>
  ),
};

export const WithIcon: Story = {
  args: {
    ...Secondary.args,
  },
  render: (args) => (
    <Button {...args}>
      <Mail /> Login with Email
    </Button>
  ),
};

export const Small: Story = {
  args: { size: "sm" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const Icon: Story = {
  args: {
    ...Secondary.args,
    children: <Mail />,
    size: "icon",
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
