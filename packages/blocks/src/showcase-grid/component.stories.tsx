import type { Meta, StoryObj } from "@storybook/react";

import { placeholderImage } from "../internal/testing/fixtures";
import { ShowcaseGrid } from "./component";

const meta = {
  args: {
    description: "Sites shipped from this template.",
    items: [
      { category: "Marketing", featured: true, siteName: "Brand A" },
      { category: "Product", siteName: "Brand B" },
      { category: "Documentation", siteName: "Docs portal" },
      { category: "Campaign", siteName: "Launch microsite" },
      { category: "Recruiting", siteName: "Careers" },
    ].map((item, index) => ({
      _key: `item-${index}`,
      attributionLogo: placeholderImage(index + 3, {
        alt: `${item.siteName} logo`,
        height: 96,
        width: 96,
      }),
      screenshot: placeholderImage(index, {
        alt: item.siteName,
        height: 1000,
        width: 1600,
      }),
      url: "https://example.com",
      ...item,
    })),
    title: "Built on the Forge",
  },
  component: ShowcaseGrid,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "blocks/Showcase Grid",
} satisfies Meta<typeof ShowcaseGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
