"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Render inside Suspense: reading the URL can suspend during prerendering. */
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
