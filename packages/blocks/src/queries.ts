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

export { ctaGroqProjection } from "./cta/query";
export { faqAccordionGroqProjection } from "./faq-accordion/query";
export { featureCardsIconGroqProjection } from "./feature-cards-icon/query";
export { heroGroqProjection } from "./hero/query";
export {
  buttonsFragment,
  imageFields,
  imageFragment,
  localizedInternalHref,
  markDefsFragment,
  muxVideoEmbedFields,
  muxVideoFields,
  richTextFragment,
  urlFragment,
} from "./internal/groq-fragments";
export { logoCloudGroqProjection } from "./logo-cloud/query";
export { richTextBlockGroqProjection } from "./rich-text-block/query";
export { showcaseGridGroqProjection } from "./showcase-grid/query";
export { socialGridGroqProjection } from "./social-grid/query";
export { subscribeNewsletterGroqProjection } from "./subscribe-newsletter/query";
export { videoFeatureGroqProjection } from "./video-feature/query";

/**
 * The `pageBuilder[]` projection. Each block owns its own projection so the
 * GROQ and the component that reads it stay in lockstep; this only composes
 * them. Sanity TypeGen resolves the interpolations statically.
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
