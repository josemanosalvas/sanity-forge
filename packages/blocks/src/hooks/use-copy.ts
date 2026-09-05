"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const COPY_RESET_MS = 1500;

export type CopyStatus = "idle" | "loading" | "copied" | "error";

/** Use text-contrast status tokens; highlight/destructive are background fills. */
export const COPY_STATUS_CLASS: Record<CopyStatus, string> = {
  // Preserve status colors while the button is hovered.
  copied: "text-success hover:text-success",
  error: "text-danger hover:text-danger",
  idle: "",
  loading: "",
};

export const SWAP_LAYER =
  "col-start-1 row-start-1 transition-[opacity,filter,scale] duration-300 ease-in-out motion-reduce:transition-none";
export const SWAP_SHOWN = "scale-100 opacity-100 blur-0";
export const SWAP_HIDDEN = "scale-[0.25] opacity-0 blur-xs";
export const SWAP_TEXT_SHOWN = "opacity-100 blur-0";
export const SWAP_TEXT_HIDDEN = "opacity-0 blur-xs";

export const useCopyToClipboard = (
  getText: () => string | Promise<string>,
  resetMs: number = COPY_RESET_MS
) => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const copy = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStatus("loading");

    let next: CopyStatus = "error";
    try {
      await navigator.clipboard.writeText(await getText());
      next = "copied";
    } catch {
      next = "error";
    }

    setStatus(next);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setStatus("idle"), resetMs);
    return next;
  }, [getText, resetMs]);

  return { copy, status };
};
