"use server";

import { setTimeout as delay } from "node:timers/promises";

import { draftMode } from "next/headers";

const DISABLE_DELAY_MS = 1000;

/** Leaves Draft Mode; the short delay lets the cookie clear before the refresh. */
export const disableDraftMode = async (): Promise<void> => {
  const draft = await draftMode();
  draft.disable();
  await delay(DISABLE_DELAY_MS);
};
