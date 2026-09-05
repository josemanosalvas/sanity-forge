import type { ThemeProviderProps } from "next-themes";

import { Toaster } from "./components/sonner";
import { TooltipProvider } from "./components/tooltip";
import { ThemeProvider } from "./providers/theme";

export type UIProviderProps = ThemeProviderProps;

export const UIProvider = ({ children, ...properties }: UIProviderProps) => (
  <ThemeProvider {...properties}>
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </ThemeProvider>
);
