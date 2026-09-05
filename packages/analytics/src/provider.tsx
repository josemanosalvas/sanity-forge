import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";

import { keys } from "./keys";

interface AnalyticsProviderProps {
  readonly children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const { NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_VERCEL_ANALYTICS } =
    keys();

  return (
    <>
      {children}
      {NEXT_PUBLIC_VERCEL_ANALYTICS !== "false" && <VercelAnalytics />}
      {NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </>
  );
};
