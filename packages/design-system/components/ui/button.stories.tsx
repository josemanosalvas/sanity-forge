import type { Meta, StoryObj } from "@storybook/react";
import { Loader2, Mail } from "lucide-react";

import { Button } from "./button";

/**
 * Displays a button or a component that looks like a button.
 */
const meta = {
  title: "ui/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
    },
    variant: {
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
      control: { type: "select" },
    },
    size: {
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
      control: { type: "select" },
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "default",
    size: "default",
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the button, used for primary actions and commands. */
export const Default: Story = {};

/** Use `outline` to reduce emphasis on secondary actions. */
export const Outline: Story = {
  args: { variant: "outline" },
};

/** Use `ghost` for minimal, less intrusive actions. */
export const Ghost: Story = {
  args: { variant: "ghost" },
};

/** Use `secondary` for actions that complement the primary one. */
export const Secondary: Story = {
  args: { variant: "secondary" },
};

/** Use `destructive` to indicate errors, alerts or irreversible actions. */
export const Destructive: Story = {
  args: { variant: "destructive" },
};

/** Use `link` for tertiary, text-only actions. */
export const Link: Story = {
  args: { variant: "link" },
};

/** Disable the button while an action is in progress and show a spinner. */
export const Loading: Story = {
  render: (args) => (
    <Button {...args}>
      <Loader2 className="animate-spin" />
      Button
    </Button>
  ),
  args: {
    ...Outline.args,
    disabled: true,
  },
};

/** Add an icon to reinforce the action. */
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Mail /> Login with Email
    </Button>
  ),
  args: {
    ...Secondary.args,
  },
};

/** Use `sm` for compact interfaces. */
export const Small: Story = {
  args: { size: "sm" },
};

/** Use `lg` for prominent calls to action. */
export const Large: Story = {
  args: { size: "lg" },
};

/** Use `icon` for a button with only an icon. */
export const Icon: Story = {
  args: {
    ...Secondary.args,
    size: "icon",
    children: <Mail />,
  },
};

/** Add `disabled` to prevent interactions. */
export const Disabled: Story = {
  args: { disabled: true },
};
