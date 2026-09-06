"use client";

import { catchError } from "next/error";
import type { ErrorInfo } from "next/error";
import { useEffect } from "react";

import { useBlockLabels } from "./block-labels";

const BlockErrorFallback = ({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) => {
  const labels = useBlockLabels();
  useEffect(() => {
    // console.error is what the site's error tracker forwards.
    console.error("[block] failed to render:", error);
  }, [error]);

  return (
    <section className="block-section" role="alert">
      <div className="container flex flex-wrap items-center justify-between gap-4 text-sm">
        <p className="text-muted-foreground">{labels.sectionFailed}</p>
        <button
          className="focus-ring border-border hover-surface border px-3 py-1.5"
          onClick={() => retry()}
          type="button"
        >
          {labels.tryAgain}
        </button>
      </div>
    </section>
  );
};

/**
 * A CMS page is a list of independently authored blocks; one that throws
 * (a malformed document, a renderer bug) should lose its own section, not
 * the page. `catchError` lets `notFound()` and `redirect()` pass through.
 */
export const BlockErrorBoundary = catchError(
  (_props: object, { error, retry }: ErrorInfo) => (
    <BlockErrorFallback error={error} retry={retry} />
  )
);
