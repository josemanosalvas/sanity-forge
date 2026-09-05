import { DesignSystemProvider } from "@repo/design-system";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/nextjs-vite";

import "./globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    (Story) => (
      <DesignSystemProvider>
        <div className="bg-background text-foreground">
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
};

export default preview;
