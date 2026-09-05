import type { Thing, WithContext } from "schema-dts";

interface JsonLdProps {
  readonly code: WithContext<Thing>;
  readonly id?: string;
}

// Escape <, >, & and the Unicode line separators so CMS text can never break
// out of the script element. JSON-LD is parsed as data, so it stays valid.
const escapeJsonForHtml = (json: string): string =>
  json
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");

export const JsonLd = ({ code, id }: JsonLdProps) => (
  <script
    // oxlint-disable-next-line react/no-danger -- structured data must reach crawlers verbatim; escapeJsonForHtml keeps it inert
    dangerouslySetInnerHTML={{
      __html: escapeJsonForHtml(JSON.stringify(code)),
    }}
    id={id}
    type="application/ld+json"
  />
);

export type * from "schema-dts";
