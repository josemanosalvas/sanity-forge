import { ctaGroqProjection } from "./cta/query";
import { faqAccordionGroqProjection } from "./faq-accordion/query";
import { featureCardsIconGroqProjection } from "./feature-cards-icon/query";
import { heroGroqProjection } from "./hero/query";
import { logoCloudGroqProjection } from "./logo-cloud/query";
import { richTextBlockGroqProjection } from "./rich-text-block/query";
import { showcaseGridGroqProjection } from "./showcase-grid/query";
import { socialGridGroqProjection } from "./social-grid/query";
import { subscribeNewsletterGroqProjection } from "./subscribe-newsletter/query";
import { videoFeatureGroqProjection } from "./video-feature/query";

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
