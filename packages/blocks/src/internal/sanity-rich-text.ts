import { CodeBlockIcon } from "@sanity/icons/CodeBlock";
import { ImageIcon } from "@sanity/icons/Image";
import { LinkIcon } from "@sanity/icons/Link";
import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { defineArrayMember, defineField } from "sanity";
import type { ConditionalProperty } from "sanity";

// Single source of truth for portable text member names
const PORTABLE_TEXT_MEMBER_NAMES = {
  block: "block",
  code: "code",
  image: "image",
  table: "table",
} as const;

const CODE_LANGUAGES = [
  { title: "TypeScript", value: "ts" },
  { title: "TSX", value: "tsx" },
  { title: "JavaScript", value: "js" },
  { title: "GROQ", value: "groq" },
  { title: "Bash", value: "bash" },
  { title: "JSON", value: "json" },
  { title: "CSS", value: "css" },
];

const PORTABLE_TEXT_BLOCK_STYLES = [
  { title: "Normal", value: "normal" },
  { title: "H2", value: "h2" },
  { title: "H3", value: "h3" },
  { title: "H4", value: "h4" },
  { title: "H5", value: "h5" },
  { title: "H6", value: "h6" },
  { title: "Inline", value: "inline" },
];

const TABLE_CELL_BLOCK_STYLES = [{ title: "Normal", value: "normal" }];

const customLinkAnnotation = {
  fields: [
    defineField({
      description:
        "Where the highlighted text takes visitors — pick a page on this site or paste a web address",
      name: "customLink",
      type: "customUrl",
    }),
  ],
  icon: LinkIcon,
  name: "customLink",
  title: "Internal/External Link",
  type: "object",
};

const PORTABLE_TEXT_MARK_DECORATORS = [
  { title: "Strong", value: "strong" },
  { title: "Emphasis", value: "em" },
  { title: "Code", value: "code" },
];

const PORTABLE_TEXT_MARKS = {
  annotations: [customLinkAnnotation],
  decorators: PORTABLE_TEXT_MARK_DECORATORS,
};

const richTextMembers = [
  defineArrayMember({
    lists: [
      { title: "Numbered", value: "number" },
      { title: "Bullet", value: "bullet" },
    ],
    marks: PORTABLE_TEXT_MARKS,
    name: PORTABLE_TEXT_MEMBER_NAMES.block,
    styles: PORTABLE_TEXT_BLOCK_STYLES,
    type: "block",
  }),
  defineArrayMember({
    fields: [
      defineField({
        description: "Describe the image for screen readers and search engines",
        name: "alt",
        title: "Alternative Text",
        type: "string",
      }),
      defineField({
        description: "Optional caption shown beneath the image.",
        name: "caption",
        title: "Caption Text",
        type: "string",
      }),
    ],
    icon: ImageIcon,
    name: PORTABLE_TEXT_MEMBER_NAMES.image,
    options: {
      hotspot: true,
    },
    title: "Image",
    type: "image",
  }),
  defineArrayMember({
    description:
      "A multi-line code snippet with preserved indentation. Use this for code examples instead of the inline Code style.",
    fields: [
      defineField({
        description: "The code snippet. Indentation and line breaks are kept.",
        name: "code",
        rows: 8,
        title: "Code",
        type: "text",
        validation: (rule) => rule.required(),
      }),
      defineField({
        description: "Optional language label shown in the code block header.",
        name: "language",
        options: {
          list: CODE_LANGUAGES,
        },
        title: "Language",
        type: "string",
      }),
      defineField({
        description: "Optional filename shown in the code block header.",
        name: "filename",
        title: "Filename",
        type: "string",
      }),
    ],
    icon: CodeBlockIcon,
    name: PORTABLE_TEXT_MEMBER_NAMES.code,
    preview: {
      prepare({ filename, language, code }) {
        const firstLine = (code ?? "").split("\n")[0]?.trim();
        return {
          subtitle: language ?? "Code",
          title: filename || firstLine || "Code Block",
        };
      },
      select: {
        code: "code",
        filename: "filename",
        language: "language",
      },
    },
    title: "Code Block",
    type: "object",
  }),
  defineArrayMember({
    fields: [
      defineField({
        description: "How many rows at the top of the table are headers.",
        name: "headerRows",
        title: "Header Rows",
        type: "number",
      }),
      defineField({
        name: "rows",
        of: [
          defineArrayMember({
            fields: [
              defineField({
                name: "cells",
                of: [
                  defineArrayMember({
                    fields: [
                      defineField({
                        name: "value",
                        of: [
                          defineArrayMember({
                            marks: PORTABLE_TEXT_MARKS,
                            styles: TABLE_CELL_BLOCK_STYLES,
                            type: "block",
                          }),
                        ],
                        type: "array",
                      }),
                    ],
                    name: "cell",
                    type: "object",
                  }),
                ],
                title: "Cells",
                type: "array",
              }),
            ],
            name: "row",
            type: "object",
          }),
        ],
        title: "Rows",
        type: "array",
      }),
    ],
    // The Portable Text table plugin (bundled with `sanity` v6.6+, enabled
    // in sanity.config.ts) strips fields the schema doesn't declare — omitting
    // `headerRows` would silently break the header-row toggle, so it's
    // required here even though the editor UI manages it directly.
    icon: ThLargeIcon,
    name: PORTABLE_TEXT_MEMBER_NAMES.table,
    preview: {
      prepare({ rows }) {
        const rowCount = Array.isArray(rows) ? rows.length : 0;
        const columnCount = Array.isArray(rows?.[0]?.cells)
          ? rows[0].cells.length
          : 0;
        return {
          title:
            rowCount && columnCount
              ? `${rowCount}×${columnCount} Table`
              : "Table",
        };
      },
      select: {
        rows: "rows",
      },
    },
    title: "Table",
    type: "object",
  }),
];

export const portableTextMemberTypes = Object.values(
  PORTABLE_TEXT_MEMBER_NAMES
);

export type PortableTextMemberType = (typeof portableTextMemberTypes)[number];

export const definePortableTextField = (
  memberTypes: PortableTextMemberType[],
  options?: {
    description?: string;
    group?: string[] | string;
    hidden?: ConditionalProperty;
    name?: string;
    title?: string;
  }
) => {
  if (memberTypes.length === 0) {
    throw new Error(
      "definePortableTextField requires at least one member type"
    );
  }

  const invalidMemberTypes = memberTypes.filter(
    (type) => !portableTextMemberTypes.includes(type)
  );
  if (invalidMemberTypes.length > 0) {
    throw new Error(
      `definePortableTextField received unsupported member types: ${invalidMemberTypes.join(", ")}`
    );
  }

  const { description = "", hidden, name = "richText" } = options ?? {};
  const selectedMembers = richTextMembers.filter(
    (member) => member.name && memberTypes.includes(member.name)
  );

  return defineField({
    ...options,
    description,
    hidden,
    name,
    of: selectedMembers,
    type: "array",
  });
};
