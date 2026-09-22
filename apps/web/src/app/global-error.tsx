"use client";

import { captureException } from "@repo/observability/client";
import { useEffect } from "react";

const GlobalError = ({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) => {
  useEffect(() => {
    captureException(error, { tags: { digest: error.digest } });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Could not load this page</title>
      </head>
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h1>Could not load this page</h1>
        <p>Try again in a moment.</p>
        {error.digest && (
          <p style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
            Error ID: {error.digest}
          </p>
        )}
        <p style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button onClick={() => retry()} type="button">
            Try again
          </button>
          {/* oxlint-disable-next-line next/no-html-link-for-pages -- the document was replaced; the router tree is gone */}
          <a href="/">Return home</a>
        </p>
      </body>
    </html>
  );
};

export default GlobalError;
