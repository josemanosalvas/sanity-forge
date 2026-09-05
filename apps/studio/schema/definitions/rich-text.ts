import {
  definePortableTextField,
  portableTextMemberTypes,
} from "@repo/blocks/internal/sanity-rich-text";
import { defineType } from "sanity";

// Reuses the shared portable-text members from @repo/blocks instead of
// redefining them (notably the code block and table) here.
export const richText = defineType({
  name: "richText",
  type: "array",
  of: definePortableTextField(portableTextMemberTypes).of,
});

export {
  definePortableTextField as customRichText,
  portableTextMemberTypes as memberTypes,
} from "@repo/blocks/internal/sanity-rich-text";
