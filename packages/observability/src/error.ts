import { captureException as sentryCaptureException } from "@sentry/nextjs";

import { log } from "./log";

/**
 * Normalizes an unknown thrown value to a message, reporting it to the
 * error tracker when one is configured. Safe to call anywhere.
 */
export const parseError = (error: unknown): string => {
  let message = "An error occurred";

  if (error instanceof Error) {
    ({ message } = error);
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else {
    message = String(error);
  }

  try {
    sentryCaptureException(error);
    log.error(message, error);
  } catch (reportingError) {
    console.error("Error while reporting an error:", reportingError);
  }

  return message;
};

export { captureException } from "@sentry/nextjs";
