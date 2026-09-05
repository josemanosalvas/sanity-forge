import { cn } from "cn";
import { PortableText } from "next-sanity";
import type {
  PortableTextBlock,
  PortableTextReactComponents,
} from "next-sanity";
import Link from "next/link";

import { headingChildrenToSlug as parseChildrenToSlug } from "../lib/heading-slug";
import { sanitizeHref } from "../lib/safe-href";
import { CodeBlock } from "./code-block";
import { SanityImage } from "./sanity-image";
import { TableBlock } from "./table-block";

const components: Partial<PortableTextReactComponents> = {
  block: {
    // The Studio only offers H2–H6, but the schema doesn't police what's
    // already stored — seeded, imported or migrated blocks can still carry
    // `style: "h1"`, and @portabletext/react's default would render a real
    // `<h1>` right next to the page's own. Demote it to the H2 renderer so the
    // outline stays single-rooted and no level is skipped. Same slug, so
    // existing anchors keep resolving.
    h1: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h2
          className="mt-12 mb-8 scroll-m-20 text-4xl leading-[48px] font-medium tracking-[-0.24px] first:mt-0"
          id={slug}
        >
          {children}
        </h2>
      );
    },
    h2: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h2
          className="mt-12 mb-8 scroll-m-20 text-4xl leading-[48px] font-medium tracking-[-0.24px] first:mt-0"
          id={slug}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h3
          className="scroll-m-20 text-3xl leading-10 font-medium tracking-[-0.24px]"
          id={slug}
        >
          {children}
        </h3>
      );
    },
    h4: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h4
          className="scroll-m-20 text-2xl leading-8 font-medium tracking-[-0.24px]"
          id={slug}
        >
          {children}
        </h4>
      );
    },
    h5: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h5 className="scroll-m-20 text-xl leading-7 font-medium" id={slug}>
          {children}
        </h5>
      );
    },
    h6: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h6 className="scroll-m-20 text-lg leading-7 font-medium" id={slug}>
          {children}
        </h6>
      );
    },
  },
  hardBreak: () => <br />,
  marks: {
    code: ({ children }) => (
      <code className="border-border text-foreground rounded-none border bg-zinc-200 px-1.5 py-0.5 font-mono text-[0.85em] before:content-none after:content-none lg:whitespace-nowrap dark:bg-zinc-800">
        {children}
      </code>
    ),
    customLink: ({ children, value }) => {
      const safeHref = sanitizeHref(value.href);
      if (!safeHref || safeHref === "#") {
        return (
          <span className="underline decoration-dotted underline-offset-2">
            Link Broken
          </span>
        );
      }
      return (
        // The anchor text is the accessible name. An `aria-label` here would
        // replace it with a raw URL, which is what a screen reader would then
        // read out in place of the words the author wrote.
        <Link
          className="underline decoration-dotted underline-offset-2"
          href={safeHref}
          prefetch={false}
          rel={value.openInNewTab ? "noopener noreferrer" : undefined}
          target={value.openInNewTab ? "_blank" : "_self"}
        >
          {children}
          {value.openInNewTab ? (
            <span className="sr-only"> (opens in a new tab)</span>
          ) : null}
        </Link>
      );
    },
  },
  types: {
    code: ({ value }) => {
      if (!value?.code) {
        return null;
      }
      return (
        <CodeBlock
          code={value.code}
          filename={value.filename}
          language={value.language}
        />
      );
    },
    image: ({ value }) => {
      if (!value?.id) {
        return null;
      }
      return (
        <figure className="my-4">
          <SanityImage
            className="h-auto w-full"
            height={900}
            image={value}
            sizes="(min-width: 1024px) 900px, calc(100vw - 40px)"
            width={1600}
          />
          {value?.caption && (
            <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    table: ({ value }) => (
      <TableBlock
        cellComponents={components}
        headerRows={value?.headerRows}
        rows={value?.rows}
      />
    ),
  },
};

// GROQ projections type block children as optional even though a real
// block always has them, so loosen that field rather than requiring `any`
// casts at every call site that passes raw query results in.
type LooseRichTextBlock = Omit<PortableTextBlock, "children" | "markDefs"> & {
  children?: PortableTextBlock["children"];
  markDefs?: PortableTextBlock["markDefs"] | null;
};

export type RichTextValue = LooseRichTextBlock[] | null | undefined;

export const RichText = <T extends RichTextValue>({
  richText,
  className,
}: Readonly<{
  richText?: T | null;
  className?: string;
}>) => {
  if (!richText) {
    return null;
  }

  return (
    <div
      className={cn(
        // `strong` is the design's highlight treatment: foreground ink at
        // normal weight, not bold.
        "prose prose-zinc dark:prose-invert prose-headings:scroll-m-24 prose-a:decoration-dotted prose-strong:font-normal prose-strong:text-foreground prose-h2:first:mt-0 dark:prose-headings:text-zinc-100 max-w-none",
        className
      )}
    >
      <PortableText
        components={components}
        onMissingComponent={(_, { nodeType, type }) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[RichText] missing component: ${nodeType} for type: ${type}`
            );
          }
        }}
        value={richText}
      />
    </div>
  );
};
