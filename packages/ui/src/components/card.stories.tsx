import type { Meta, StoryObj } from "@storybook/react";
import { BellRing } from "lucide-react";

import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const notifications = [
  { description: "1 hour ago", title: "Your call has been confirmed." },
  { description: "1 hour ago", title: "You have a new message!" },
  { description: "2 hours ago", title: "Your subscription is expiring soon!" },
];

const meta = {
  argTypes: {},
  args: {
    className: "w-96",
  },
  component: Card,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notifications.map((notification) => (
          <div className="flex items-center gap-4" key={notification.title}>
            <BellRing className="size-6" />
            <div>
              <p>{notification.title}</p>
              <p className="text-muted-foreground">
                {notification.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Close</Button>
      </CardFooter>
    </Card>
  ),
  tags: ["autodocs"],
  title: "ui/Card",
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
