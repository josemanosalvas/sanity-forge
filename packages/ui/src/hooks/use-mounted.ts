"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {
  // nothing to unsubscribe
};

/** `false` on the server and during hydration, `true` once mounted on the client. */
export const useMounted = (): boolean =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
