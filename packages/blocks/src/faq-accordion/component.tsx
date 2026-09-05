"use client";

import { cn } from "cn";
import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { BlockEyebrow } from "../internal/block-eyebrow";
import type { RichTextValue } from "../internal/rich-text";
import { RichText } from "../internal/rich-text";
import { useDisclosureAnimation } from "../internal/use-disclosure-animation";

export interface FaqItem {
  _key?: string | null;
  _id: string;
  richText?: RichTextValue;
  title?: string | null;
}

export interface FaqCategory {
  _key?: string | null;
  title?: string | null;
  faqs?: FaqItem[] | null;
}

export interface FaqLink {
  _key?: string | null;
  description?: string | null;
  href?: string | null;
  openInNewTab?: boolean | null;
  title?: string | null;
}

export interface FaqAccordionProps {
  _key?: string;
  categories?: FaqCategory[] | null;
  eyebrow?: string | null;
  link?: FaqLink | null;
  subtitle?: string | null;
  title?: string | null;
}

const DISCLOSURE_BASE_CLASS =
  "group border border-border bg-background px-4 transition-colors duration-150 has-[summary:focus-visible]:[outline:2px_dotted_var(--foreground)] has-[summary:focus-visible]:[outline-offset:-2px] motion-reduce:transition-none";
// `animation-duration-300`, not `duration-300`: the latter also sets
// `transition-duration`, which stretched the hover fade above to the entrance's
// 300ms while the code chip inside switched instantly.
const DISCLOSURE_ANIMATION_CLASS =
  "fade-in slide-in-from-bottom-2 animate-in fill-mode-both animation-duration-300 ease-out motion-reduce:animate-none";

function FaqDisclosure({
  animationDelay,
  faq,
  isOpen,
  onToggle,
}: Readonly<{
  animationDelay: string;
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}>) {
  const { detailsRef, contentRef } = useDisclosureAnimation(isOpen);
  // Captured once: the native `open` attribute only seeds the first render.
  // oxlint-disable-next-line react/hook-use-state -- the setter is intentionally unused
  const [initialOpen] = useState(isOpen);

  const handleSummaryClick = (event: ReactMouseEvent<HTMLElement>) => {
    event.preventDefault();
    onToggle();
  };

  return (
    <details
      className={cn(
        DISCLOSURE_BASE_CLASS,
        DISCLOSURE_ANIMATION_CLASS,
        // Open item is a settled surface: no hover wash, by design.
        isOpen
          ? "border-transparent bg-zinc-100 dark:bg-zinc-900"
          : "hover-surface"
      )}
      open={initialOpen}
      ref={detailsRef}
      style={{ animationDelay }}
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-2.5 py-4 outline-none [&::-webkit-details-marker]:hidden"
        onClick={handleSummaryClick}
      >
        <h3 className="text-foreground text-lg leading-6 font-medium">
          {faq.title}
        </h3>
        <Plus
          className={cn(
            "text-foreground dark:text-highlight pointer-events-none size-5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
            isOpen && "rotate-45"
          )}
        />
      </summary>
      {faq.richText?.length ? (
        <div className="overflow-hidden" ref={contentRef}>
          <div className="text-muted-foreground min-h-0 pb-4">
            <RichText className="body-text" richText={faq.richText} />
          </div>
        </div>
      ) : null}
    </details>
  );
}

function FaqList({ faqs }: Readonly<{ faqs: FaqItem[] }>) {
  const defaultFaq = faqs.find((faq) => faq?.title);
  const defaultOpenId = defaultFaq
    ? (defaultFaq._key ?? defaultFaq._id)
    : undefined;
  // Exclusive-open lives in state (not the details `name` attribute) so the
  // sibling that closes animates instead of snapping shut.
  const [openId, setOpenId] = useState(defaultOpenId);

  return (
    <div className="grid content-start gap-4">
      {faqs.map((faq, index) => {
        if (!faq?.title) {
          return null;
        }
        const itemId = faq._key ?? faq._id;
        return (
          <FaqDisclosure
            animationDelay={`${Math.min(index, 8) * 45}ms`}
            faq={faq}
            isOpen={itemId === openId}
            key={`faq-${itemId}`}
            onToggle={() =>
              setOpenId((current) => (current === itemId ? undefined : itemId))
            }
          />
        );
      })}
    </div>
  );
}

function CategoryTabs({
  categories,
  activeIndex,
  onSelect,
}: Readonly<{
  categories: FaqCategory[];
  activeIndex: number;
  onSelect: (index: number) => void;
}>) {
  return (
    <div className="flex h-full flex-col gap-6">
      <ul className="grid gap-1">
        {categories.map((category, index) => {
          const isActive = index === activeIndex;
          const number = String(index + 1).padStart(2, "0");
          return (
            <li key={`faq-category-${category._key ?? index}`}>
              <button
                aria-pressed={isActive}
                className="focus-ring group flex w-full items-center gap-2 rounded-none px-1 py-0.5 text-left"
                onClick={() => onSelect(index)}
                type="button"
              >
                <span
                  className={cn(
                    "shrink-0 px-1 py-px font-mono text-sm leading-5 font-light tracking-[0.28px] uppercase",
                    isActive
                      ? "bg-highlight text-highlight-foreground"
                      : "text-muted-foreground group-hover:bg-foreground group-hover:text-background"
                  )}
                >
                  {number}
                </span>
                <span
                  className={cn(
                    "font-mono text-sm leading-5 font-light tracking-[0.28px] uppercase",
                    isActive
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {category.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div
        aria-hidden="true"
        className="bg-grid-dots hidden w-full max-w-[149px] flex-1 text-zinc-800 lg:block dark:text-zinc-50"
      />
    </div>
  );
}

function FaqHeader({
  eyebrow,
  title,
  subtitle,
}: Readonly<Pick<FaqAccordionProps, "eyebrow" | "title" | "subtitle">>) {
  return (
    <div className="flex flex-col items-start gap-6">
      <BlockEyebrow eyebrow={eyebrow} />
      {(title || subtitle) && (
        <div className="flex flex-col gap-5">
          {title && (
            <h2 className="text-foreground text-4xl leading-tight font-normal tracking-[-0.24px] md:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="body-text text-muted-foreground max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FaqContactLink({ link }: Readonly<{ link: FaqLink }>) {
  if (!(link.href && (link.description || link.title))) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {link.title && (
        <p className="text-muted-foreground text-base">{link.title}</p>
      )}
      <Link
        aria-label={link.description ?? link.title ?? "Learn more"}
        className="focus-ring group inline-flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-1 focus-visible:outline-offset-0!"
        href={link.href}
        rel={link.openInNewTab ? "noopener noreferrer" : undefined}
        target={link.openInNewTab ? "_blank" : "_self"}
      >
        {link.description && (
          <p className="text-foreground text-base leading-7 font-normal">
            {link.description}
          </p>
        )}
        <span className="bg-highlight text-highlight-foreground flex items-center justify-center overflow-hidden rounded-full p-1.5">
          <ArrowUpRight
            className="transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:rotate-45"
            size={14}
          />
        </span>
      </Link>
    </div>
  );
}

export function FaqAccordion({
  _key,
  categories,
  eyebrow,
  title,
  subtitle,
  link,
}: Readonly<FaqAccordionProps>) {
  const [activeIndex, setActiveIndex] = useState(0);

  const validCategories = (categories ?? []).filter((category) =>
    category?.faqs?.some((faq) => faq?.title)
  );

  const hasCategories = validCategories.length > 0;
  const boundedIndex = hasCategories
    ? Math.min(activeIndex, validCategories.length - 1)
    : 0;
  const activeCategory = validCategories[boundedIndex];
  const activeFaqs = activeCategory?.faqs ?? [];
  // Remounts FaqList per category so the default-open item resets.
  const accordionKey = `faq-${_key}-${activeCategory?._key ?? boundedIndex}`;

  return (
    <section className="block-section" id="faq">
      <div className="container">
        <FaqHeader eyebrow={eyebrow} subtitle={subtitle} title={title} />

        <div className="mt-12 flex flex-col gap-6 lg:mt-16">
          <div
            className={cn(
              "grid items-stretch gap-10 lg:gap-16",
              hasCategories && "lg:grid-cols-[minmax(0,12rem)_1fr]"
            )}
          >
            {hasCategories && (
              <CategoryTabs
                activeIndex={boundedIndex}
                categories={validCategories}
                onSelect={setActiveIndex}
              />
            )}

            <div className="flex flex-col gap-6">
              <FaqList faqs={activeFaqs} key={accordionKey} />
              {link && <FaqContactLink link={link} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
