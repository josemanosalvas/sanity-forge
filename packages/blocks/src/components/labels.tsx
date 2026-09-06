"use client";

import { useBlockLabels } from "./block-labels";
import type { BlockLabels } from "./block-labels";

type StringLabel = {
  [K in keyof BlockLabels]: BlockLabels[K] extends string ? K : never;
}[keyof BlockLabels];

/**
 * Leaf-sized client boundaries for the few strings a block renders itself,
 * so a block whose only browser need is a label can stay a Server Component
 * and keep PortableText, tables and code blocks out of the bundle.
 */
export const BlockLabel = ({ name }: { name: StringLabel }) =>
  useBlockLabels()[name];

/** Accessible name of a card that links out to the named project. */
export const VisitLabel = ({ name }: { name: string }) =>
  useBlockLabels().visit(name);
