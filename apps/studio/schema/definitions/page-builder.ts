import { blockSchemas } from "@repo/blocks/schemas";
import { defineArrayMember, defineField, defineType } from "sanity";

import { GROUP } from "../../lib/constants";

export const pageBuilder = defineType({
  name: "pageBuilder",
  type: "array",
  of: blockSchemas.map(({ name }) => defineArrayMember({ type: name })),
  options: {
    insertMenu: {
      views: [
        {
          name: "grid",
          previewImageUrl: (schemaTypeName) => {
            const kebabCaseName = schemaTypeName
              .replaceAll(/([a-z])([A-Z])/g, "$1-$2")
              .toLowerCase();
            return `/static/thumbnails/preview-${kebabCaseName}.png`;
          },
        },
      ],
    },
  },
});

export const pageBuilderField = defineField({
  name: "pageBuilder",
  type: "pageBuilder",
  description:
    "Build your page by adding different sections like text, images, and other content blocks",
  group: GROUP.MAIN_CONTENT,
});
