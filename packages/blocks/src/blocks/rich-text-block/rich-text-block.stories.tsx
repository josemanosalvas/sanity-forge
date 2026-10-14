import type { Meta, StoryObj } from "@storybook/react";

import { paragraph, paragraphs } from "../../testing/fixtures";
import { RichTextBlock } from "./rich-text-block";

const meta = {
  args: {
    eyebrow: "Guide",
    richText: [
      ...(paragraphs(
        "Add the site to sites.ts. Studio creates a workspace from that entry, and the proxy maps its hostname to the site key.",
        "The locales array selects which languages the site serves. Its first entry is the default language."
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
