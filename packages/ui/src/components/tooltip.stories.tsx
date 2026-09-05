import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";

import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta = {
  argTypes: {
    children: {
      control: "text",
    },
    side: {
      control: { type: "radio" },
      options: ["top", "bottom", "left", "right"],
    },
  },
  args: {
    children: "Add to library",
    side: "top",
  },
  component: TooltipContent,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={<Button aria-label="Add" size="icon" variant="outline" />}
        >
          <Plus />
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </TooltipProvider>
  ),
  tags: ["autodocs"],
  title: "ui/Tooltip",
} satisfies Meta<typeof TooltipContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Bottom: Story = {
  args: { side: "bottom" },
};

export const Left: Story = {
  args: { side: "left" },
};

export const Right: Story = {
  args: { side: "right" },
};
