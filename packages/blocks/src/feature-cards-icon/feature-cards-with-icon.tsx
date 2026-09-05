import { BlockHeader } from "../components/block-header";
import type { RichTextValue } from "../components/rich-text";
import { RichText } from "../components/rich-text";
import { SanityIcon } from "../components/sanity-icon";

export interface FeatureCard {
  _key?: string | null;
  icon?: string | null;
  richText?: RichTextValue;
  title?: string | null;
}

export interface FeatureCardsIconProps {
  cards?: FeatureCard[] | null;
  eyebrow?: string | null;
  richText?: RichTextValue;
  title?: string | null;
}

const FeatureCardItem = ({ card }: Readonly<{ card: FeatureCard }>) => {
  const { icon, title, richText } = card;
  return (
    <div className="group bg-background text-foreground hover:bg-highlight hover:text-highlight-foreground flex min-w-0 transform-gpu flex-col gap-12 p-[31.2px] transition-colors duration-200 ease-out lg:row-span-3 lg:grid lg:min-h-72 lg:grid-rows-subgrid lg:gap-0">
      {icon && (
        <div className="relative -mr-[31.2px] flex h-12 items-center lg:row-start-1 lg:mb-12">
          <span
            aria-hidden="true"
            className="bg-grid-dots text-highlight-foreground absolute inset-y-0 right-0 left-12 bg-left opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
          />
          <div className="bg-grid-dots group-hover:text-highlight-foreground dark:group-hover:text-highlight-foreground relative flex size-12 items-center justify-center bg-center text-zinc-800 transition-colors duration-200 ease-out dark:text-zinc-50">
            <span className="bg-background group-hover:bg-highlight flex size-7 items-center justify-center transition-colors duration-200 ease-out">
              <SanityIcon className="size-6" icon={icon} />
            </span>
          </div>
        </div>
      )}
      {/* Dissolved on lg so heading and body land in the shared subgrid rows. */}
      <div className="flex min-w-0 flex-col gap-2 lg:contents">
        {title ? (
          <h3 className="text-xl leading-8 font-medium text-balance break-words lg:row-start-2 lg:mb-2 lg:min-w-0">
            {title}
          </h3>
        ) : null}
        <RichText
          className="body-text text-muted-foreground group-hover:text-highlight-foreground/80 break-words transition-colors duration-200 ease-out lg:row-start-3 lg:min-w-0"
          richText={richText}
        />
      </div>
    </div>
  );
};

export const FeatureCardsWithIcon = ({
  eyebrow,
  title,
  richText,
  cards,
}: Readonly<FeatureCardsIconProps>) => (
  <section className="block-section" id="features">
    <div className="container">
      <BlockHeader eyebrow={eyebrow} title={title}>
        <RichText
          className="body-text text-muted-foreground max-w-xl"
          richText={richText}
        />
      </BlockHeader>
      <div className="bleed-x bg-grid-dots mt-12 [background-size:7px_7px] p-[var(--container-px,0.5rem)] text-zinc-800 md:mt-16 lg:p-[42px] dark:text-zinc-50">
        <div className="grid gap-[var(--container-px,0.5rem)] lg:grid-cols-3 lg:gap-0">
          {cards?.map((card, index) => (
            <FeatureCardItem
              card={card}
              key={card._key ?? `FeatureCard-${index}`}
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);
