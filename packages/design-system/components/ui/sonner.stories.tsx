import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import { Button } from "./button";
import { Toaster } from "./sonner";

/**
 * An opinionated toast component for React.
 */
const meta = {
  argTypes: {},
  args: {
    position: "bottom-right",
  },
  component: Toaster,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  title: "ui/Sonner",
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the toaster. */
export const Default: Story = {
  render: (args) => (
    <div className="flex min-h-96 items-center justify-center space-x-2">
      <Button
        onClick={() =>
          toast("Event has been created", {
            action: {
              label: "Undo",
              onClick: () => toast.dismiss(),
            },
            description: new Date().toLocaleString(),
          })
        }
        variant="outline"
      >
        Show toast
      </Button>
      <Toaster {...args} />
    </div>
  ),
};
