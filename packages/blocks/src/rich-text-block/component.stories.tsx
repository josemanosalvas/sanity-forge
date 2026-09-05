import type { Meta, StoryObj } from "@storybook/react";

import { paragraph, paragraphs } from "../internal/testing/fixtures";
import { RichTextBlock } from "./component";

const meta = {
  args: {
    eyebrow: "Guide",
    richText: [
      ...(paragraphs(
        "Register the site in the host registry, add a Studio workspace and deploy. The proxy maps the hostname to the site key on every request.",
        "Locales live next to the site, so a site can serve any subset of the app's languages."
      ) ?? []),
      ...(paragraph("Checklist", "h3") ?? []),
      ...(paragraph("Add the site key, name, locales and production domain.") ??
        []),
    ],
    title: "Adding a site",
  },
  component: RichTextBlock,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Rich Text",
} satisfies Meta<typeof RichTextBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
