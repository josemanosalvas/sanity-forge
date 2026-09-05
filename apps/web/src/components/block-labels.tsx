"use client";

import { BlockLabelsProvider } from "@repo/blocks/components/block-labels";
import type { BlockLabels as Labels } from "@repo/blocks/components/block-labels";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import type { ReactNode } from "react";

/** Hands the blocks the strings they render themselves, in the request's locale. */
export const BlockLabels = ({ children }: { children: ReactNode }) => {
  const t = useTranslations("blocks");
  const labels = useMemo<Labels>(
    () => ({
      copied: t("copied"),
      copyCode: t("copyCode"),
      linkBroken: t("linkBroken"),
      logoCloud: t("logoCloud"),
      newsletter: {
        emailLabel: t("newsletter.emailLabel"),
        emailPlaceholder: t("newsletter.emailPlaceholder"),
        subscribe: t("newsletter.subscribe"),
        subscribeToNewsletter: t("newsletter.subscribeToNewsletter"),
        subscribing: t("newsletter.subscribing"),
      },
      opensInNewTab: t("opensInNewTab"),
      playVideo: (title) =>
        title ? t("playVideoTitled", { title }) : t("playVideo"),
      showcase: t("showcase"),
      visit: (name) => t("visit", { name }),
    }),
    [t]
  );
  return <BlockLabelsProvider labels={labels}>{children}</BlockLabelsProvider>;
};
