import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Label } from "./label";
import { Textarea } from "./textarea";

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

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea {...args} id="message" />
    </div>
  ),
};

export const WithButton: Story = {
  render: (args) => (
    <div className="grid w-full gap-2">
      <Textarea {...args} />
      <Button type="submit">Send message</Button>
    </div>
  ),
};
