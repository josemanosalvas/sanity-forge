"use client";

import { useBlockLabels } from "./block-labels";
import type { BlockLabels } from "./block-labels";

type StringLabel = {
  [K in keyof BlockLabels]: BlockLabels[K] extends string ? K : never;
}[keyof BlockLabels];

export const BlockLabel = ({ name }: { name: StringLabel }) =>
  useBlockLabels()[name];

export const VisitLabel = ({ name }: { name: string }) =>
  useBlockLabels().visit(name);
