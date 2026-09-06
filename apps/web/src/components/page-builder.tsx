"use client";

import { useOptimistic } from "next-sanity/hooks";

import {
  blockWrapperClassName,
  isLeadingHero,
} from "@/components/block-wrapper";
import type { RenderedBlock } from "@/components/block-wrapper";
import { sanityDataAttribute } from "@/lib/data-attribute";

interface OptimisticDocument {
  pageBuilder?: { _key?: string }[];
}

/**
 * Applies Presentation's drag-and-drop reordering optimistically. The
 * mutation carries the raw document, not the projected blocks, so only the
 * `_key` order is taken; a just-inserted block appears after revalidation.
 */
const useOptimisticPageBlocks = (
  initialBlocks: readonly RenderedBlock[],
  documentId: string
) =>
  useOptimistic<readonly RenderedBlock[], OptimisticDocument>(
    initialBlocks,
    (currentBlocks, action) => {
      const incoming = action.document.pageBuilder;
      if (action.id !== documentId || !Array.isArray(incoming)) {
        return currentBlocks;
      }
      const resolved = new Map(
        currentBlocks.map((block) => [block.key, block])
      );
      const reordered: RenderedBlock[] = [];
      for (const raw of incoming) {
        const block = raw?._key ? resolved.get(raw._key) : undefined;
        if (block) {
          reordered.push(block);
        }
      }
      return reordered;
    }
  );

export interface PageBuilderProps {
  /** Server-rendered blocks; this component only orders and annotates them. */
  readonly blocks: readonly RenderedBlock[];
  readonly id: string;
  readonly type: string;
}

/**
 * The Draft Mode page: a client boundary around already-rendered blocks, so
 * Presentation can reorder them and select them through `data-sanity`
 * without the block renderers entering the browser bundle.
 */
export const PageBuilder = ({
  blocks: initialBlocks,
  id,
  type,
}: PageBuilderProps) => {
  const blocks = useOptimisticPageBlocks(initialBlocks, id);

  if (!blocks.length) {
    return null;
  }

  return (
    <div
      className="grid min-w-0 grid-cols-1"
      data-sanity={sanityDataAttribute({ id, path: "pageBuilder", type })}
    >
      {blocks.map((block, index) => {
        const leadingHero = isLeadingHero(block, index);
        return (
          <div
            className={blockWrapperClassName(leadingHero)}
            data-sanity={
              leadingHero
                ? undefined
                : sanityDataAttribute({
                    id,
                    path: `pageBuilder[_key=="${block.key}"]`,
                    type,
                  })
            }
            key={`${block.type}-${block.key}`}
          >
            {block.node}
          </div>
        );
      })}
    </div>
  );
};
