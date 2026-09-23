"use server";

import { draftMode } from "next/headers";

/** Leaves Draft Mode; the preview bar refreshes the page once this resolves. */
export const disableDraftMode = async (): Promise<void> => {
  const draft = await draftMode();
  draft.disable();
};
