import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";

import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

/**
 * A popup that displays information related to an element when the element
 * receives keyboard focus or the mouse hovers over it.
 */
const meta = {
  title: "ui/Tooltip",
  component: TooltipContent,
  tags: ["autodocs"],
  argTypes: {
    side: {
      options: ["top", "bottom", "left", "right"],
      control: { type: "radio" },
    },
    children: {
      control: "text",
    },
  },
  args: {
    side: "top",
    children: "Add to library",
  },
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
} satisfies Meta<typeof TooltipContent>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the tooltip. */
export const Default: Story = {};

/** Display the tooltip below the element. */
export const Bottom: Story = {
  args: { side: "bottom" },
};

/** Display the tooltip to the left of the element. */
export const Left: Story = {
  args: { side: "left" },
};

/** Display the tooltip to the right of the element. */
export const Right: Story = {
  args: { side: "right" },
};
