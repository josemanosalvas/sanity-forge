import type { Meta, StoryObj } from "@storybook/react";

import { ModeToggle } from "./mode-toggle";

const meta = {
  component: ModeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/ModeToggle",
} satisfies Meta<typeof ModeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
