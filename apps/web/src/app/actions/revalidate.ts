"use server";

import { parseTags } from "next-sanity/live";
import { revalidateTag, updateTag } from "next/cache";
import { draftMode } from "next/headers";

/**
 * Runs for every Sanity Live content event. In Draft Mode `updateTag`
 * gives editors read-your-own-writes; for visitors the tags expire with
 * stale-while-revalidate and open tabs refresh.
 */
export const revalidateSyncTags = async (unsafeTags: unknown) => {
  const { isEnabled } = await draftMode();
  const { tags } = parseTags(unsafeTags);

  if (isEnabled) {
    for (const tag of tags) {
      updateTag(tag);
    }
    return;
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
  return "refresh" as const;
};
