import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "./separator";

/**
 * Visually or semantically separates content.
 */
const meta = {
  title: "ui/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A horizontal separator between stacked content. */
export const Horizontal: Story = {
  render: () => (
    <div className="grid gap-2">
      <div>Top</div>
      <Separator orientation="horizontal" />
      <div>Bottom</div>
    </div>
  ),
};

/** A vertical separator between inline content. */
export const Vertical: Story = {
  render: () => (
    <div className="flex gap-2">
      <div>Left</div>
      <Separator className="h-auto" orientation="vertical" />
      <div>Right</div>
    </div>
  ),
};
