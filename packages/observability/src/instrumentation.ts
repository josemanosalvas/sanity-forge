/** Forwards Next.js request errors to the tracker (no-op without a DSN). */
export { captureRequestError as onRequestError } from "@sentry/nextjs";

/** `register()` for the app's `instrumentation.ts`. */
export const initializeObservability = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeObservability: initializeServer } =
      await import("./server");
    initializeServer();
  }
};
