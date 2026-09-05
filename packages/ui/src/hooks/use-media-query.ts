"use client";

import { useCallback, useSyncExternalStore } from "react";

interface MediaQueryListLike {
  matches: boolean;
  addEventListener: (
    type: string,
    listener: (event: MediaQueryListEvent) => void
  ) => void;
  removeEventListener: (
    type: string,
    listener: (event: MediaQueryListEvent) => void
  ) => void;
}

const canMatchMedia = () => typeof globalThis.matchMedia === "function";

// One MediaQueryList per query, shared by subscribe and getSnapshot.
const mediaQueryCache = new Map<string, MediaQueryListLike>();

const getMediaQueryList = (query: string): MediaQueryListLike | null => {
  if (!canMatchMedia()) {
    return null;
  }
  let media = mediaQueryCache.get(query);
  if (!media) {
    media = globalThis.matchMedia(query);
    mediaQueryCache.set(query, media);
  }
  return media;
};

// undefined on the server and during the first hydration render, so the tree
// matches the server output before the client-only matchMedia read kicks in.
const SERVER_SNAPSHOT = undefined;
const getServerSnapshot = () => SERVER_SNAPSHOT;

export const useMediaQuery = (query: string): boolean | undefined => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const media = getMediaQueryList(query);
      if (!media) {
        return () => {
          // nothing to unsubscribe from on the server
        };
      }
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = () => getMediaQueryList(query)?.matches;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
