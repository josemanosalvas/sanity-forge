import { MAX_SYNC_TAGS } from "@repo/sanity/tags";
// Types only: the helper of the same name returns the handler unchanged.
import type { SyncTagInvalidateEventHandler } from "@sanity/functions";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set; add it with \`sanity functions env add\``
    );
  }
  return value;
};

/**
 * Forwards a publish's sync tags to the web app's `/api/revalidate`, then
 * tells Sanity the invalidation is complete. A failed delivery throws instead,
 * so it shows in the Function logs and is never acknowledged.
 */
export const handler: SyncTagInvalidateEventHandler = async ({
  done,
  event,
}) => {
  const endpoint = requireEnv("REVALIDATE_URL");
  const secret = requireEnv("SANITY_REVALIDATE_SECRET");
  const syncTags = [...new Set(event.data.syncTags)];

  for (let start = 0; start < syncTags.length; start += MAX_SYNC_TAGS) {
    const batch = syncTags.slice(start, start + MAX_SYNC_TAGS);
    // oxlint-disable-next-line no-await-in-loop -- one batch at a time keeps the app's load flat
    const response = await fetch(endpoint, {
      body: JSON.stringify({ syncTags: batch }),
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(
        `${endpoint} answered HTTP ${response.status} for ${batch.length} sync tags`
      );
    }
  }

  const acknowledged = await done(event.data.syncTags);
  if (!acknowledged.ok) {
    throw new Error(`Sanity answered HTTP ${acknowledged.status} to done()`);
  }
  console.log(`Invalidated ${syncTags.length} sync tags`);
};
