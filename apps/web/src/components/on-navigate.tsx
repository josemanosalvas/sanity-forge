"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Calls `onNavigate` when the route changes after this mounts. Renders
 * nothing. It reads the URL, so render it inside a Suspense boundary; mounting
 * it only while the UI it closes is open keeps it out of prerendering entirely.
 */
export const OnNavigate = ({ onNavigate }: { onNavigate: () => void }) => {
  const pathname = usePathname();
  const mountedOn = useRef(pathname);
  useEffect(() => {
    if (pathname !== mountedOn.current) {
      onNavigate();
    }
  }, [pathname, onNavigate]);
  return null;
};
