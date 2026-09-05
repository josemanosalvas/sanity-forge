import { UIProvider } from "@repo/ui/provider";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/nextjs-vite";

import "./globals.css";

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      defaultTheme: "light",
      themes: {
        dark: "dark",
        light: "light",
      },
    }),
    (Story) => (
      <UIProvider>
        <div className="bg-background text-foreground">
          <Story />
        </div>
      </UIProvider>
    ),
  ],
  parameters: {
    backgrounds: { disable: true },
  },
};

export default preview;
