import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Label } from "./label";
import { Textarea } from "./textarea";

/**
 * Displays a form textarea or a component that looks like a textarea.
 */
const meta = {
  argTypes: {},
  args: {
    className: "w-96",
    disabled: false,
    placeholder: "Type your message here.",
  },
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Textarea",
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the textarea. */
export const Default: Story = {};

/** Use `disabled` to disable the textarea. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Pair the textarea with a `Label`. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea {...args} id="message" />
    </div>
  ),
};

/** Combine the textarea with a submit button. */
export const WithButton: Story = {
  render: (args) => (
    <div className="grid w-full gap-2">
      <Textarea {...args} />
      <Button type="submit">Send message</Button>
    </div>
  ),
};
