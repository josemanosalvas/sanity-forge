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
  title: "ui/Sheet",
  component: SheetContent,
  tags: ["autodocs"],
  argTypes: {
    side: {
      options: ["top", "bottom", "left", "right"],
      control: { type: "radio" },
    },
  },
  args: {
    side: "right",
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
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SheetContent>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the sheet. */
export const Default: Story = {};
