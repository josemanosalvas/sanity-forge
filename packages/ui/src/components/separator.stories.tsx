import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "./separator";

const meta = {
  argTypes: {},
  component: Separator,
  tags: ["autodocs"],
  title: "ui/Separator",
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="grid gap-2">
      <div>Top</div>
      <Separator orientation="horizontal" />
      <div>Bottom</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex gap-2">
      <div>Left</div>
      <Separator className="h-auto" orientation="vertical" />
      <div>Right</div>
    </div>
  ),
};
