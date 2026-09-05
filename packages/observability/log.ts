/**
 * The one logging surface packages and apps use. Structured arguments are
 * passed through untouched so a hosted log drain can index them; in
 * development the console is the drain.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug: (message: string, ...context: unknown[]) => void;
  info: (message: string, ...context: unknown[]) => void;
  warn: (message: string, ...context: unknown[]) => void;
  error: (message: string, ...context: unknown[]) => void;
}

const prefixed =
  (scope: string, level: LogLevel) =>
  (message: string, ...context: unknown[]) => {
    const line = `[${scope}] ${message}`;
    switch (level) {
      case "debug": {
        console.debug(line, ...context);
        break;
      }
      case "info": {
        console.info(line, ...context);
        break;
      }
      case "warn": {
        console.warn(line, ...context);
        break;
      }
      default: {
        console.error(line, ...context);
      }
    }
  };

/** A logger bound to a scope, e.g. `createLogger("revalidate")`. */
export const createLogger = (scope: string): Logger => ({
  debug: prefixed(scope, "debug"),
  error: prefixed(scope, "error"),
  info: prefixed(scope, "info"),
  warn: prefixed(scope, "warn"),
});

export const log = createLogger("app");
