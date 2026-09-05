import type { Meta, StoryObj } from "@storybook/react";

import { placeholderImage } from "../internal/testing/fixtures";
import { ShowcaseGrid } from "./component";

const meta = {
  title: "blocks/Showcase Grid",
  component: ShowcaseGrid,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    title: "Built on the Forge",
    description: "Sites shipped from this template.",
    items: [
      { siteName: "Brand A", category: "Marketing", featured: true },
      { siteName: "Brand B", category: "Product" },
      { siteName: "Docs portal", category: "Documentation" },
      { siteName: "Launch microsite", category: "Campaign" },
      { siteName: "Careers", category: "Recruiting" },
    ].map((item, index) => ({
      _key: `item-${index}`,
      url: "https://example.com",
      screenshot: placeholderImage(index, {
        width: 1600,
        height: 1000,
        alt: item.siteName,
      }),
      attributionLogo: placeholderImage(index + 3, {
        width: 96,
        height: 96,
        alt: `${item.siteName} logo`,
      }),
      ...item,
    })),
  },
} satisfies Meta<typeof ShowcaseGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
