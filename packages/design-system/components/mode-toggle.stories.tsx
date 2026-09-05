import type { Meta, StoryObj } from "@storybook/react";

import { ModeToggle } from "./mode-toggle";

/**
 * Switches between light, dark and system themes via next-themes.
 */
const meta = {
  title: "design-system/ModeToggle",
  component: ModeToggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ModeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
