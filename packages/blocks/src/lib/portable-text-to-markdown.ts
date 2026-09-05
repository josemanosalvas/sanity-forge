import {
  DefaultNormalRenderer,
  portableTextToMarkdown as officialPortableTextToMarkdown,
} from "@portabletext/markdown";

export interface PortableTextSpan {
  _type?: string;
  _key?: string | null;
  text?: string | null;
  marks?: string[] | null;
}

export interface PortableTextMarkDef {
  _key?: string | null;
  _type?: string | null;
  href?: string | null;
}

export interface PortableTextNode {
  _type?: string;
  _key?: string | null;
  style?: string | null;
  listItem?: string | null;
  level?: number | null;
  children?: PortableTextSpan[] | null;
  markDefs?: PortableTextMarkDef[] | null;
  id?: string | null;
  alt?: string | null;
  caption?: string | null;
  code?: string | null;
  language?: string | null;
  filename?: string | null;
  headerRows?: number | null;
  rows?: PortableTextTableRow[] | null;
}

export interface PortableTextTableRow {
  cells?: { value?: PortableTextNode[] | null }[] | null;
}

export interface MarkdownImage {
  id?: string | null;
  alt?: string | null;
  caption?: string | null;
}

export interface MarkdownOptions {
  /** Without a resolver, images fall back to caption or alt text. */
  resolveImageUrl?: (image: MarkdownImage) => string | null | undefined;
  /** Origin for root-relative links. Omit to keep links relative. */
  baseUrl?: string;
}

export type PortableTextValue = PortableTextNode[] | null | undefined;

// Prefix a root-relative path (`/about`) with `baseUrl`. Absolute, `//`, `#`,
// and scheme links (`mailto:`) pass through; no-op without `baseUrl`.
export const absolutizeUrl = (
  href: string | null | undefined,
  baseUrl?: string | null
): string => {
  const url = (href ?? "").trim();
  if (!(url && baseUrl) || !url.startsWith("/") || url.startsWith("//")) {
    return url;
  }
  // Strip trailing slashes (loop, not a ReDoS-prone regex).
  let base = baseUrl;
  while (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  return `${base}${url}`;
};

const UNSAFE_URL_SCHEME = /^\s*(?:javascript|vbscript|data):/iu;

// Wrap spaces and parentheses in CommonMark angle brackets; reject unsafe schemes.
export const formatUrl = (href: string | null | undefined): string => {
  // Strip ASCII control chars (browsers ignore them) so `java\nscript:` can't
  // slip past the scheme check.
  // oxlint-disable-next-line no-control-regex -- stripping control characters is the fix
  const url = (href ?? "").replaceAll(/[\u0000-\u001F]/gu, "").trim();
  if (!url || UNSAFE_URL_SCHEME.test(url)) {
    return "";
  }
  return /[\s()]/u.test(url) ? `<${url}>` : url;
};

// Escape plain CMS strings; Portable Text handles its own marks.
export const escapeMarkdown = (text: string): string =>
  text.replaceAll(/(?<char>[\\`*_[\]<>~|#])/gu, String.raw`\$<char>`);

const longestBacktickRun = (text: string): number =>
  Math.max(0, ...(text.match(/`+/gu) ?? []).map((run) => run.length));

// Inline code span: fence with one more backtick than the longest inner run,
// padded when the content borders a backtick (CommonMark §6.1).
const wrapInlineCode = (text: string): string => {
  const fence = "`".repeat(longestBacktickRun(text) + 1);
  const body = text.startsWith("`") || text.endsWith("`") ? ` ${text} ` : text;
  return `${fence}${body}${fence}`;
};

interface AnyBlock {
  _type: string;
  [key: string]: unknown;
}

// Use a longer fence than any embedded backticks (CommonMark §4.5).
const fenceCodeBlock = (code: string, language?: string | null): string => {
  const fence = "`".repeat(Math.max(3, longestBacktickRun(code) + 1));
  // Strip backticks and newlines so the info string can't break out of or
  // prematurely close the fence.
  const info = (language ?? "").replaceAll(/[\n\r`]/gu, "").trim();
  // Trim trailing newlines with a linear scan; a `/\n+$/` regex backtracks.
  let end = code.length;
  while (end > 0 && code.codePointAt(end - 1) === 10) {
    end -= 1;
  }
  const body = code.slice(0, end);
  return `${fence}${info}\n${body}\n${fence}`;
};

// Escape column separators and flatten newlines for GFM tables.
const escapeTableCell = (text: string): string =>
  text.replaceAll("|", String.raw`\|`).replaceAll(/\n+/gu, "<br>");

const renderTableRow = (cells: string[]): string => `| ${cells.join(" | ")} |`;

// GFM requires one header row; use the first row regardless of Studio headerRows.
const renderTable = (
  node: PortableTextNode,
  options: MarkdownOptions,
  serialize: (blocks: PortableTextValue, options: MarkdownOptions) => string
): string => {
  const rows = node.rows ?? [];
  if (rows.length === 0) {
    return "";
  }

  const rowsMarkdown = rows.map((row) =>
    (row.cells ?? []).map((cell) =>
      escapeTableCell(serialize(cell.value, options))
    )
  );
  const columnCount = Math.max(0, ...rowsMarkdown.map((cells) => cells.length));
  if (columnCount === 0) {
    return "";
  }
  const pad = (cells: string[]) =>
    Array.from({ length: columnCount }, (_, index) => cells.at(index) ?? "");

  const [headerCells = [], ...bodyCells] = rowsMarkdown;
  return [
    renderTableRow(pad(headerCells)),
    renderTableRow(Array.from({ length: columnCount }, () => "---")),
    ...bodyCells.map((cells) => renderTableRow(pad(cells))),
  ].join("\n");
};

export const portableTextToMarkdown = (
  blocks?: PortableTextValue,
  options: MarkdownOptions = {}
): string => {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return officialPortableTextToMarkdown(blocks as AnyBlock[], {
    // Escape paragraph-leading syntax. Actual list items use the list renderer.
    block: {
      normal: (opts) =>
        DefaultNormalRenderer(opts)
          .replaceAll(/^(?<marker>[-+*]) /gmu, String.raw`\$<marker> `)
          .replaceAll(
            /^(?<number>\d+)(?<delimiter>[.)]) /gmu,
            String.raw`$<number>\$<delimiter> `
          )
          .replaceAll(/^(?<quote>>) /gmu, String.raw`\$<quote> `)
          .replaceAll(/^(?<hashes>#{1,6}) /gmu, String.raw`\$<hashes> `)
          .replaceAll(/^(?<rule>[-*_]{3,})$/gmu, String.raw`\$<rule>`),
    },
    marks: {
      code: ({ children }) => wrapInlineCode(children),
      customLink: ({ value, children }) => {
        const href = value?.href as string | null | undefined;
        if (!href || href === "#") {
          return children;
        }
        return `[${children}](${formatUrl(absolutizeUrl(href, options.baseUrl))})`;
      },
      // Underline has no Markdown equivalent — emit plain text, not `<u>`.
      underline: ({ children }) => children,
    },
    types: {
      code: ({ value }) => {
        const node = value as PortableTextNode;
        const code = node.code ?? "";
        if (!code.trim()) {
          return "";
        }
        return fenceCodeBlock(code, node.language);
      },
      image: ({ value, isInline }) => {
        if (isInline) {
          return "";
        }
        const node = value as PortableTextNode;
        const alt = (node.alt ?? "").trim();
        const caption = (node.caption ?? "").trim();
        const url = node.id
          ? options.resolveImageUrl?.(node as MarkdownImage)
          : undefined;

        if (url) {
          const img = `![${alt}](${formatUrl(url)})`;
          return caption && caption !== alt ? `${img}\n\n_${caption}_` : img;
        }

        return caption || alt;
      },
      table: ({ value }) =>
        renderTable(value as PortableTextNode, options, portableTextToMarkdown),
    },
    // Suppress unknown block types; the default emits a JSON code block.
    unknownType: () => "",
  }).trim();
};
