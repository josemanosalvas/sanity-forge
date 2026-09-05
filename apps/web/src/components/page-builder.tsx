"use client";

import { cn } from "cn";
import { useOptimistic } from "next-sanity/hooks";
import dynamic from "next/dynamic";

import { sanityDataAttribute } from "@/lib/data-attribute";
import type { PageBuilderBlock } from "@/types";

const CTABlock = dynamic(async () => {
  const block = await import("@repo/blocks/cta");
  return block.CTABlock;
});
const FaqAccordion = dynamic(async () => {
  const block = await import("@repo/blocks/faq-accordion");
  return block.FaqAccordion;
});
const FeatureCardsWithIcon = dynamic(async () => {
  const block = await import("@repo/blocks/feature-cards-icon");
  return block.FeatureCardsWithIcon;
});
const HeroBlock = dynamic(async () => {
  const block = await import("@repo/blocks/hero");
  return block.HeroBlock;
});
const LogoCloud = dynamic(async () => {
  const block = await import("@repo/blocks/logo-cloud");
  return block.LogoCloud;
});
const RichTextBlock = dynamic(async () => {
  const block = await import("@repo/blocks/rich-text-block");
  return block.RichTextBlock;
});
const ShowcaseGrid = dynamic(async () => {
  const block = await import("@repo/blocks/showcase-grid");
  return block.ShowcaseGrid;
});
const SocialGrid = dynamic(async () => {
  const block = await import("@repo/blocks/social-grid");
  return block.SocialGrid;
});
const SubscribeNewsletter = dynamic(async () => {
  const block = await import("@repo/blocks/subscribe-newsletter");
  return block.SubscribeNewsletter;
});
const VideoFeature = dynamic(async () => {
  const block = await import("@repo/blocks/video-feature");
  return block.VideoFeature;
});

export interface PageBuilderProps {
  readonly pageBuilder?: PageBuilderBlock[];
  readonly id: string;
  readonly type: string;
}

const renderBlockComponent = (
  block: PageBuilderBlock,
  isFirst: boolean,
  dataSanity?: string
) => {
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

interface OptimisticDocument {
  pageBuilder?: { _key?: string }[];
}

/**
 * Applies Presentation's drag-and-drop reordering optimistically. The
 * mutation carries the raw document, not the projected blocks, so only the
 * `_key` order is taken; a just-inserted block appears after revalidation.
 */
const useOptimisticPageBuilder = (
  initialBlocks: PageBuilderBlock[],
  documentId: string
) =>
  useOptimistic<PageBuilderBlock[], OptimisticDocument>(
    initialBlocks,
    (currentBlocks, action) => {
      const incoming = action.document.pageBuilder;
      if (action.id !== documentId || !Array.isArray(incoming)) {
        return currentBlocks;
      }
      const resolved = new Map(
        currentBlocks.map((block) => [block._key, block])
      );
      const reordered: PageBuilderBlock[] = [];
      for (const raw of incoming) {
        const block = raw?._key ? resolved.get(raw._key) : undefined;
        if (block) {
          reordered.push(block);
        }
      }
      return reordered;
    }
  );

const NO_BLOCKS: PageBuilderBlock[] = [];

export const PageBuilder = ({ pageBuilder, id, type }: PageBuilderProps) => {
  const blocks = useOptimisticPageBuilder(pageBuilder ?? NO_BLOCKS, id);

  if (!blocks.length) {
    return null;
  }

  return (
    <div
      className="grid min-w-0 grid-cols-1"
      data-sanity={sanityDataAttribute({ id, path: "pageBuilder", type })}
    >
      {blocks.map((block, index) => {
        // The leading hero's wrapper is `display: contents` so its banner can
        // pin; a box-less element is unselectable in the overlay, so the
        // attribute is handed to the hero itself.
        const isLeadingHero = index === 0 && block?._type === "hero";
        const dataSanity = sanityDataAttribute({
          id,
          path: `pageBuilder[_key=="${block._key}"]`,
          type,
        });
        const content = renderBlockComponent(
          block,
          index === 0,
          isLeadingHero ? dataSanity : undefined
        );

        return (
          <div
            className={cn(
              "min-w-0",
              isLeadingHero ? "contents" : "bg-background relative z-10"
            )}
            data-sanity={isLeadingHero ? undefined : dataSanity}
            key={`${block._type}-${block._key}`}
          >
            {content ?? <UnknownBlock blockType={block?._type ?? "unknown"} />}
          </div>
        );
      })}
    </div>
  );
};
