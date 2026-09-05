import type { Meta, StoryObj } from "@storybook/react";

import { paragraph, placeholderImage } from "../internal/testing/fixtures";
import { SubscribeNewsletter } from "./component";

const meta = {
  title: "blocks/Subscribe Newsletter",
  component: SubscribeNewsletter,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    title: "Get the changelog in your inbox",
    subTitle: paragraph(
      "One email per release. No tracking pixels, unsubscribe any time."
    ),
    helperText: paragraph("We only use your address to send the newsletter."),
    onSubmit: (event) => event.preventDefault(),
  },
} satisfies Meta<typeof SubscribeNewsletter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTestimonial: Story = {
  args: {
    testimonial: {
      eyebrow: "From a reader",
      quote: paragraph("The only template newsletter I actually open."),
      authorName: "Alex Rivera",
      authorRole: "Engineering lead",
      authorImage: placeholderImage(5, {
        width: 96,
        height: 96,
        alt: "Alex Rivera",
      }),
    },
  },
};
