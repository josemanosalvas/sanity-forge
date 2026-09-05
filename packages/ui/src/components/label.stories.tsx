import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./label";

const meta = {
  argTypes: {
    children: {
      control: { type: "text" },
    },
  },
  args: {
    children: "Your email address",
    htmlFor: "email",
  },
  component: Label,
  tags: ["autodocs"],
  title: "ui/Label",
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
