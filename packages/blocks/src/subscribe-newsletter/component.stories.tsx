import type { Meta, StoryObj } from "@storybook/react";

import { paragraph, placeholderImage } from "../internal/testing/fixtures";
import { SubscribeNewsletter } from "./component";

const meta = {
  args: {
    helperText: paragraph("We only use your address to send the newsletter."),
    onSubmit: (event) => event.preventDefault(),
    subTitle: paragraph(
      "One email per release. No tracking pixels, unsubscribe any time."
    ),
    title: "Get the changelog in your inbox",
  },
  component: SubscribeNewsletter,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Subscribe Newsletter",
} satisfies Meta<typeof SubscribeNewsletter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTestimonial: Story = {
  args: {
    testimonial: {
      authorImage: placeholderImage(5, {
        alt: "Alex Rivera",
        height: 96,
        width: 96,
      }),
      authorName: "Alex Rivera",
      authorRole: "Engineering lead",
      eyebrow: "From a reader",
      quote: paragraph("The only template newsletter I actually open."),
    },
  },
};
