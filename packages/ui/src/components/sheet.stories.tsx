import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

/**
 * Extends the Dialog component to display content that complements the main
 * content of the screen.
 */
const meta = {
  argTypes: {
    side: {
      control: { type: "radio" },
      options: ["top", "bottom", "left", "right"],
    },
  },
  args: {
    side: "right",
  },
  component: SheetContent,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button variant="ghost" />}>Cancel</SheetClose>
          <Button>Submit</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  tags: ["autodocs"],
  title: "ui/Sheet",
} satisfies Meta<typeof SheetContent>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the sheet. */
export const Default: Story = {};
