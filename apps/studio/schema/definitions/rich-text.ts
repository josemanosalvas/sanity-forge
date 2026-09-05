import {
  definePortableTextField,
  portableTextMemberTypes,
} from "@repo/blocks/lib/sanity-rich-text";
import { defineType } from "sanity";

// Reuses the shared portable-text members from @repo/blocks instead of
// redefining them (notably the code block and table) here.
export const richText = defineType({
  name: "richText",
  of: definePortableTextField(portableTextMemberTypes).of,
  type: "array",
});

export {
  definePortableTextField as customRichText,
  portableTextMemberTypes as memberTypes,
} from "@repo/blocks/lib/sanity-rich-text";
