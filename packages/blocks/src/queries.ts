import { ctaGroqProjection } from "./blocks/cta/query";
import { faqAccordionGroqProjection } from "./blocks/faq-accordion/query";
import { featureCardsIconGroqProjection } from "./blocks/feature-cards-icon/query";
import { heroGroqProjection } from "./blocks/hero/query";
import { logoCloudGroqProjection } from "./blocks/logo-cloud/query";
import { richTextBlockGroqProjection } from "./blocks/rich-text-block/query";
import { showcaseGridGroqProjection } from "./blocks/showcase-grid/query";
import { socialGridGroqProjection } from "./blocks/social-grid/query";
import { subscribeNewsletterGroqProjection } from "./blocks/subscribe-newsletter/query";
import { videoFeatureGroqProjection } from "./blocks/video-feature/query";

/**
 * The `pageBuilder[]` projection. Each block owns its own projection so the
 * GROQ and the component that reads it stay in lockstep; this only composes
 * them. Sanity TypeGen resolves the interpolations statically. Shared
 * fragments live in `@repo/blocks/lib/groq-fragments`.
 */
export const pageBuilderProjection = `
  pageBuilder[]{
    ...,
    _type,
    ${ctaGroqProjection},
    ${heroGroqProjection},
    ${faqAccordionGroqProjection},
    ${featureCardsIconGroqProjection},
    ${subscribeNewsletterGroqProjection},
    ${logoCloudGroqProjection},
    ${socialGridGroqProjection},
    ${showcaseGridGroqProjection},
    ${richTextBlockGroqProjection},
    ${videoFeatureGroqProjection}
  }
` as const;
