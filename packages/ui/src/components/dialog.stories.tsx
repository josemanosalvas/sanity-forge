import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  argTypes: {},
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this account?</DialogTitle>
          <DialogDescription>
            Deleting your account removes its data permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Continue</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  tags: ["autodocs"],
  title: "ui/Dialog",
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
