import { DesignSystemProvider } from "@repo/design-system";
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
      <DesignSystemProvider>
        <div className="bg-background text-foreground">
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    backgrounds: { disable: true },
  },
};

export default preview;
