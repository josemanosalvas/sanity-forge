import type { ThemeProviderProps } from "next-themes";

import { Toaster } from "./components/sonner";
import { TooltipProvider } from "./components/tooltip";
import { ThemeProvider } from "./providers/theme";

export type DesignSystemProviderProps = ThemeProviderProps;

/**
 * Composes the providers the design system needs at the root of an app:
 * theme (next-themes), tooltips and the toast outlet. It deliberately knows
 * nothing about content, analytics, auth or any other application concern.
 */
export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProps) => (
  <ThemeProvider {...properties}>
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </ThemeProvider>
);
