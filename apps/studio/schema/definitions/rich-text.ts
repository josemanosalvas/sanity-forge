import {
  definePortableTextField,
  portableTextMemberTypes,
} from "@repo/blocks/lib/sanity-rich-text";
import { defineType } from "sanity";

export const richText = defineType({
  name: "richText",
  of: definePortableTextField(portableTextMemberTypes).of,
  type: "array",
});
