import type { Meta, StoryObj } from "@storybook/react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

/**
 * A collection of links for navigating websites.
 */
const meta = {
  title: "ui/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Overview
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Documentation</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1 p-2">
              <li>
                <NavigationMenuLink
                  className="hover:bg-muted block rounded-md p-2"
                  href="#"
                >
                  API Reference
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  className="hover:bg-muted block rounded-md p-2"
                  href="#"
                >
                  Getting Started
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  className="hover:bg-muted block rounded-md p-2"
                  href="#"
                >
                  Guides
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default form of the navigation menu. */
export const Default: Story = {};
