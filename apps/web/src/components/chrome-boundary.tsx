"use client";

import { captureException } from "@repo/observability/client";
import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";
import { catchError } from "next/error";
import type { ErrorInfo } from "next/error";
import { useEffect } from "react";

type Slot = "header" | "footer" | "data";

const ChromeFallback = ({
  error,
  retry,
  slot,
}: {
  error: unknown;
  retry: () => void;
  slot: Slot;
}) => {
  const t = useTranslations("error");
  useEffect(() => {
    captureException(error, { tags: { slot } });
  }, [error, slot]);

  if (slot === "data") {
    return null;
  }

  const Tag = slot;
  return (
    <Tag
      className={
        slot === "header"
          ? "border-border min-h-16 border-b"
          : "border-border min-h-64 border-t"
      }
    >
      <div className="container flex min-h-16 items-center justify-between gap-4 py-3 text-sm">
        <p className="text-muted-foreground">{t("chrome")}</p>
        <Button onClick={() => retry()} size="sm" variant="outline">
          {t("retry")}
        </Button>
      </div>
    </Tag>
  );
};

/**
 * Keeps a failed navigation, footer or structured-data read from replacing
 * the whole document: the root layout renders those reads beside `children`,
 * where the segment's error.tsx cannot reach them, so without this boundary
 * a transient CMS error lands on global-error.tsx. Errors thrown while
 * prerendering still fail `next build`; the fallback only ever serves a
 * request-time render.
 */
export const ChromeBoundary = catchError(
  ({ slot }: { slot: Slot }, { error, retry }: ErrorInfo) => (
    <ChromeFallback error={error} retry={retry} slot={slot} />
  )
);
