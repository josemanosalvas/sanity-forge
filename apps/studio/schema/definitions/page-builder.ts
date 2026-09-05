import { blockSchemas } from "@repo/blocks/schemas";
import { defineArrayMember, defineField, defineType } from "sanity";

import { GROUP } from "../../lib/constants";

export const pageBuilder = defineType({
  name: "pageBuilder",
  of: blockSchemas.map(({ name }) => defineArrayMember({ type: name })),
  options: {
    // Add `previewImageUrl` to the grid view once block thumbnails exist.
    insertMenu: { views: [{ name: "list" }, { name: "grid" }] },
  },
  type: "array",
});

export const pageBuilderField = defineField({
  description:
    "Build your page by adding different sections like text, images, and other content blocks",
  group: GROUP.MAIN_CONTENT,
  name: "pageBuilder",
  type: "pageBuilder",
});
