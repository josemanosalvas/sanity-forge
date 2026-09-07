import { cn } from "cn";
import type { ReactNode } from "react";

/** Keep this module free of renderer imports: the client reorderer uses it. */
export interface RenderedBlock {
  readonly key: string;
  readonly type: string;
  readonly node: ReactNode;
}

/** A `display: contents` wrapper has no overlay target; annotate the hero itself. */
export const isLeadingHero = (block: RenderedBlock, index: number) =>
  index === 0 && block.type === "hero";

export const blockWrapperClassName = (leadingHero: boolean) =>
  cn("min-w-0", leadingHero ? "contents" : "bg-background relative z-10");
