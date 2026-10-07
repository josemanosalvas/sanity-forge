/**
 * The `id` a page-builder section renders. Editors and other sites link to the
 * bare id (`/about#faq`), so the first block of a type keeps it; a repeat of
 * that type on the same page appends its `_key`, which survives reordering.
 */
export const sectionId = (base: string, repeatKey?: string) =>
  repeatKey ? `${base}-${repeatKey}` : base;

/**
 * Each block's `repeatKey`, in page order: its `_key` when a block of the same
 * type that renders a section is higher on the page, otherwise `undefined`. A
 * block that renders nothing never takes the bare id from a visible one below.
 */
export const sectionRepeatKeys = <
  Block extends { _key: string; _type: string },
>(
  blocks: readonly Block[],
  rendersSection: (block: Block) => boolean
) =>
  blocks.map((block, index) => {
    const first = blocks.findIndex(
      (other) => other._type === block._type && rendersSection(other)
    );
    return first !== -1 && first < index ? block._key : undefined;
  });
