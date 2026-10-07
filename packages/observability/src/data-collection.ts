import type { init } from "@sentry/nextjs";

type DataCollection = NonNullable<Parameters<typeof init>[0]["dataCollection"]>;

/** Header and query keys v10 scrubbed as PII. */
const piiKeys = { deny: ["forwarded", "-ip", "remote-", "via", "-user"] };

/**
 * Sentry 11 collects cookies, headers, bodies and user IPs unless told
 * otherwise. Keep v10's restrictive defaults: preview requests carry draft-mode
 * cookies, and visitor IPs need a consent decision first.
 */
export const dataCollection: DataCollection = {
  cookies: false,
  databaseQueryData: false,
  genAI: { inputs: false, outputs: false },
  graphQL: { document: false, variables: false },
  httpBodies: [],
  httpHeaders: { request: piiKeys, response: piiKeys },
  queues: false,
  urlQueryParams: piiKeys,
  userInfo: false,
};
