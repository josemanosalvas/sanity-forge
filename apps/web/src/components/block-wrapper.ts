import { cn } from "cn";
import type { ReactNode } from "react";

/**
 * Shared by the server renderer and the client reorderer. Kept free of
 * renderer imports so the client module graph never reaches the blocks.
 */
export interface RenderedBlock {
  readonly key: string;
  readonly type: string;
  readonly node: ReactNode;
}

/**
 * A leading hero's wrapper is `display: contents` so its banner can pin; a
 * box-less element is unselectable in the overlay, so the visual-editing
 * attribute is handed to the hero itself instead of its wrapper.
 */
export const isLeadingHero = (block: RenderedBlock, index: number) =>
  index === 0 && block.type === "hero";

export const blockWrapperClassName = (leadingHero: boolean) =>
  cn("min-w-0", leadingHero ? "contents" : "bg-background relative z-10");
