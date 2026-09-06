"use client";

import { Link } from "@repo/internationalization/navigation";
import { captureException } from "@repo/observability/client";
import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

/**
 * Server Component errors reach the browser with a generic message and a
 * `digest` that matches the server-side log line, so the digest is the
 * identifier a visitor can quote; the tracker's event is tagged with it.
 */
const ErrorBoundary = ({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) => {
  const t = useTranslations("error");

  useEffect(() => {
    captureException(error, { tags: { digest: error.digest } });
  }, [error]);

  return (
    <section className="block-section">
      <div className="container grid max-w-2xl justify-items-center gap-6 py-24 text-center">
        <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("body")}</p>
        {error.digest && (
          <p className="text-muted-foreground font-mono text-xs">
            {t("errorId")}: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => retry()} size="lg" variant="secondary">
            {t("retry")}
          </Button>
          <Button render={<Link href="/" />} size="lg" variant="outline">
            {t("home")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ErrorBoundary;
