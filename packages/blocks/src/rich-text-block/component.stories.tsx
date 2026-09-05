import type { Meta, StoryObj } from "@storybook/react";

import { paragraph, paragraphs } from "../internal/testing/fixtures";
import { RichTextBlock } from "./component";

const meta = {
  title: "blocks/Rich Text",
  component: RichTextBlock,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Guide",
    title: "Adding a site",
    richText: [
      ...(paragraphs(
        "Register the site in the host registry, add a Studio workspace and deploy. The proxy maps the hostname to the site key on every request.",
        "Locales live next to the site, so a site can serve any subset of the app's languages."
      ) ?? []),
      ...(paragraph("Checklist", "h3") ?? []),
      ...(paragraph("Add the site key, name, locales and production domain.") ??
        []),
    ],
  },
} satisfies Meta<typeof RichTextBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
