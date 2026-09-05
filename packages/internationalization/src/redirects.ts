/**
 * Editor-managed redirects become `next.config.ts` redirects. Next parses
 * `source` and `destination` with path-to-regexp, where `( ) { } : * + ?`
 * carry meaning and an unbalanced or unescaped character fails `next build`,
 * and it treats `has: { type: "host", value }` as a regular expression. The
 * Studio validates paths with these rules and the build skips anything that
 * still slips through, so one document can never break every deployment.
 */
const SEGMENT = "[A-Za-z0-9._~%-]+";
const PATH = `\\/(?:${SEGMENT}(?:\\/${SEGMENT})*)?`;
const QUERY = "(?:\\?[A-Za-z0-9._~%=&-]*)?";

const SOURCE_PATTERN = new RegExp(`^${PATH}$`, "u");
const DESTINATION_PATTERN = new RegExp(`^${PATH}${QUERY}$`, "u");

/** A public path visitors can request: `/`, `/old-page`, `/de/alte-seite`. */
export const isRedirectSource = (value: unknown): value is string =>
  typeof value === "string" && SOURCE_PATTERN.test(value);

/** Like a source, optionally with a query string: `/new-page?ref=old`. */
export const isRedirectDestination = (value: unknown): value is string =>
  typeof value === "string" && DESTINATION_PATTERN.test(value);

/** The `has: host` value for a hostname, escaped so `.` matches only a dot. */
export const hostMatcher = (host: string): string =>
  host.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
