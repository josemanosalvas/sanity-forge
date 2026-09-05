import type { ReactNode } from "react";

import { BlockEyebrow } from "./block-eyebrow";

export const BlockHeader = ({
  eyebrow,
  title,
  children,
}: Readonly<{
  eyebrow?: string | null;
  title?: string | null;
  children?: ReactNode;
}>) => (
  <div className="flex flex-col items-start gap-6">
    <BlockEyebrow eyebrow={eyebrow} />
    <div className="flex flex-col items-start gap-5">
      {title ? <h2 className="block-title max-w-2xl">{title}</h2> : null}
      {children}
    </div>
  </div>
);
