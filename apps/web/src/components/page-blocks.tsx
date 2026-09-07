import { BlockErrorBoundary } from "@repo/blocks/components/block-error";
import { CTABlock } from "@repo/blocks/cta";
import { FaqAccordion } from "@repo/blocks/faq-accordion";
import { FeatureCardsWithIcon } from "@repo/blocks/feature-cards-icon";
import { HeroBlock } from "@repo/blocks/hero";
import { LogoCloud } from "@repo/blocks/logo-cloud";
import { RichTextBlock } from "@repo/blocks/rich-text-block";
import { ShowcaseGrid } from "@repo/blocks/showcase-grid";
import { SocialGrid } from "@repo/blocks/social-grid";
import { SubscribeNewsletter } from "@repo/blocks/subscribe-newsletter";
import { VideoFeature } from "@repo/blocks/video-feature";
import type { ReactNode } from "react";

import {
  blockWrapperClassName,
  isLeadingHero,
} from "@/components/block-wrapper";
import type { RenderedBlock } from "@/components/block-wrapper";
import { sanityDataAttribute } from "@/lib/data-attribute";
import type { PageBuilderBlock } from "@/types";

const renderBlock = (
  block: PageBuilderBlock,
  isFirst: boolean,
  dataSanity?: string
): ReactNode => {
  switch (block?._type) {
    case "cta": {
      return <CTABlock {...block} />;
    }
    case "faqAccordion": {
      return <FaqAccordion {...block} />;
    }
    case "hero": {
      return <HeroBlock {...block} dataSanity={dataSanity} isFirst={isFirst} />;
    }
    case "featureCardsIcon": {
      return <FeatureCardsWithIcon {...block} />;
    }
    case "subscribeNewsletter": {
      return <SubscribeNewsletter {...block} />;
    }
    case "logoCloud": {
      return <LogoCloud {...block} />;
    }
    case "socialGrid": {
      return <SocialGrid {...block} />;
    }
    case "showcaseGrid": {
      return <ShowcaseGrid {...block} />;
    }
    case "richTextBlock": {
      return <RichTextBlock {...block} />;
    }
    case "videoFeature": {
      return <VideoFeature {...block} />;
    }
    default: {
      return null;
    }
  }
};

const UnknownBlock = ({ blockType }: { blockType: string }) => (
  <div
    className="border-muted-foreground/20 bg-muted text-muted-foreground flex items-center justify-center rounded-lg border-2 border-dashed p-8 text-center"
    role="alert"
  >
    <div className="space-y-2">
      <p>Component not found for block type:</p>
      <code className="bg-background rounded px-2 py-1 font-mono text-sm">
        {blockType}
      </code>
    </div>
  </div>
);

/** Optimistic reorder moves existing elements; layout props update after revalidation. */
export const renderPageBlocks = ({
  blocks,
  id,
  type,
  editable,
}: {
  blocks: readonly PageBuilderBlock[];
  id: string;
  type: string;
  editable: boolean;
}): RenderedBlock[] =>
  blocks.map((block, index) => {
    const isFirst = index === 0;
    const leadingHero = isFirst && block?._type === "hero";
    const dataSanity =
      editable && leadingHero
        ? sanityDataAttribute({
            id,
            path: `pageBuilder[_key=="${block._key}"]`,
            type,
          })
        : undefined;
    const content = renderBlock(block, isFirst, dataSanity);
    const fallback = editable ? (
      <UnknownBlock blockType={block?._type ?? "unknown"} />
    ) : null;
    return {
      key: block._key,
      node: <BlockErrorBoundary>{content ?? fallback}</BlockErrorBoundary>,
      type: block._type,
    };
  });

export const PageBlocks = ({
  blocks,
}: {
  blocks: readonly RenderedBlock[];
}) => {
  if (!blocks.length) {
    return null;
  }
  return (
    <div className="grid min-w-0 grid-cols-1">
      {blocks.map((block, index) => (
        <div
          className={blockWrapperClassName(isLeadingHero(block, index))}
          key={`${block.type}-${block.key}`}
        >
          {block.node}
        </div>
      ))}
    </div>
  );
};
