"use client";

import { useEffect, useRef } from "react";

export const DISCLOSURE_ANIMATION_MS = 200;

const DISCLOSURE_TIMING: KeyframeAnimationOptions = {
  duration: DISCLOSURE_ANIMATION_MS,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
};

/**
 * Animate height while keeping details.open true until collapse finishes.
 * Attach contentRef to an overflow-hidden wrapper. Keep the initial DOM open
 * attribute fixed and drive later toggles through the hook, preventing the
 * summary click default.
 */
export const useDisclosureAnimation = (open: boolean) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const previousOpenRef = useRef(open);

  useEffect(() => {
    if (previousOpenRef.current === open) {
      return;
    }
    previousOpenRef.current = open;

    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details) {
      return;
    }

    if (
      !content ||
      typeof content.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      animationRef.current?.cancel();
      animationRef.current = null;
      details.open = open;
      return;
    }

    // Read height before cancelling, which would discard the interrupted position.
    const startHeight = details.open ? content.offsetHeight : 0;
    animationRef.current?.cancel();

    let animation: Animation;
    if (open) {
      details.open = true;
      const targetHeight = content.offsetHeight;
      animation = content.animate(
        [{ height: `${startHeight}px` }, { height: `${targetHeight}px` }],
        DISCLOSURE_TIMING
      );
      animation.onfinish = () => {
        animationRef.current = null;
      };
    } else {
      animation = content.animate(
        [{ height: `${startHeight}px` }, { height: "0px" }],
        DISCLOSURE_TIMING
      );
      // Keep `details.open` true while collapsing so the content stays
      // rendered; a cancel (reopen) skips onfinish and leaves it open.
      animation.onfinish = () => {
        details.open = false;
        animationRef.current = null;
      };
    }
    animationRef.current = animation;
  }, [open]);

  useEffect(
    () => () => {
      animationRef.current?.cancel();
    },
    []
  );

  return { contentRef, detailsRef };
};
