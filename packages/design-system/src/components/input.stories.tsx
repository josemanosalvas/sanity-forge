import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

/**
 * Displays a form input field or a component that looks like an input field.
 */
const meta = {
  argTypes: {},
  args: {
    className: "w-96",
    disabled: false,
    placeholder: "Email",
    type: "email",
  },
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Input",
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the input field. */
export const Default: Story = {};

/** Use `disabled` to make the input non-interactive. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Pair the input with a `Label`. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid items-center gap-1.5">
      <Label htmlFor="email">{args.placeholder}</Label>
      <Input {...args} id="email" />
    </div>
  ),
};

/** Add helper text below the field. */
export const WithHelperText: Story = {
  render: (args) => (
    <div className="grid items-center gap-1.5">
      <Label htmlFor="email-2">{args.placeholder}</Label>
      <Input {...args} id="email-2" />
      <p className="text-muted-foreground text-sm">Enter your email address.</p>
    </div>
  ),
};

/** Combine the input with a submit button. */
export const WithButton: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Input {...args} />
      <Button type="submit">Subscribe</Button>
    </div>
  ),
};
