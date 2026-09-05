"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { captureException } from "@repo/observability/error";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <section className="block-section">
      <div className="container grid max-w-2xl justify-items-center gap-6 py-24 text-center">
        <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="text-muted-foreground">
          The page could not be rendered. Try again, or come back in a moment.
        </p>
        <Button onClick={() => retry()} size="lg" variant="secondary">
          Try again
        </Button>
      </div>
    </section>
  );
}
