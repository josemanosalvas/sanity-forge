"use client";

import { useLinkStatus } from "next/link";

/** Place inside a Link to show pending navigation without a loading.tsx. */
export const LinkStatus = () => {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className="bg-highlight ml-1 inline-block size-1.5 shrink-0 rounded-full opacity-0 transition-opacity delay-150 data-pending:animate-pulse data-pending:opacity-100"
      data-pending={pending ? "" : undefined}
    />
  );
};
