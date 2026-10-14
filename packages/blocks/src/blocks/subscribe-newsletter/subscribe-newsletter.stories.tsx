import type { Meta, StoryObj } from "@storybook/react";

import { paragraph, placeholderImage } from "../../testing/fixtures";
import { SubscribeNewsletter } from "./subscribe-newsletter";

const meta = {
  args: {
    helperText: paragraph(
      "This example form does not send your email address."
    ),
    onSubmit: (event) => event.preventDefault(),
    subTitle: paragraph("Receive an email when a new release is available."),
    title: "Subscribe to release notes",
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
      authorRole: "Example author",
      eyebrow: "Example testimonial",
      quote: paragraph("This is sample text for the testimonial layout."),
    },
  },
};
