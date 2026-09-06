import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import { keys } from "./keys";

interface AnalyticsProviderProps {
  readonly children: ReactNode;
}

/**
 * Third-party scripts, all loaded after hydration by their maintained
 * integrations and each switchable through a public key:
 *
 * - Vercel Web Analytics: page views and custom events (`@repo/analytics/client`).
 * - Vercel Speed Insights: real-user LCP, INP and CLS. Field data at the 75th
 *   percentile is what search ranking uses, and the only way to know whether
 *   an image, font or script change helped.
 * - Google Analytics: only when a measurement ID is configured.
 */
export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const {
    NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_VERCEL_ANALYTICS,
    NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS,
  } = keys();

  return (
    <>
      {children}
      {NEXT_PUBLIC_VERCEL_ANALYTICS !== "false" && <VercelAnalytics />}
      {NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS !== "false" && <SpeedInsights />}
      {NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </>
  );
};
