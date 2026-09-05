"use client";

import { captureException } from "@repo/observability/error";
import { useEffect } from "react";

const GlobalError = ({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) => {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h1>Something went wrong</h1>
        <p>The application failed to render.</p>
        <button onClick={() => retry()} type="button">
          Try again
        </button>
      </body>
    </html>
  );
};

export default GlobalError;
