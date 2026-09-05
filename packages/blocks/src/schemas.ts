import { ctaSchema } from "./cta/schema";
import { faqAccordionSchema } from "./faq-accordion/schema";
import { featureCardsIconSchema } from "./feature-cards-icon/schema";
import { heroSchema } from "./hero/schema";
import { logoCloudSchema } from "./logo-cloud/schema";
import { richTextBlockSchema } from "./rich-text-block/schema";
import { showcaseGridSchema } from "./showcase-grid/schema";
import { socialGridSchema } from "./social-grid/schema";
import { subscribeNewsletterSchema } from "./subscribe-newsletter/schema";
import { videoFeatureSchema } from "./video-feature/schema";

export { ctaSchema } from "./cta/schema";
export { faqAccordionSchema } from "./faq-accordion/schema";
export { featureCardsIconSchema } from "./feature-cards-icon/schema";
export { heroSchema } from "./hero/schema";
export { logoCloudSchema } from "./logo-cloud/schema";
export { richTextBlockSchema } from "./rich-text-block/schema";
export { showcaseGridSchema } from "./showcase-grid/schema";
export { socialGridSchema } from "./social-grid/schema";
export { subscribeNewsletterSchema } from "./subscribe-newsletter/schema";
export { videoFeatureSchema } from "./video-feature/schema";

/**
 * Every page-builder block schema, in the order the Studio's insert menu
 * shows them. The page builder array type and the GROQ projection in
 * `./queries` are derived from this list, so adding a block here is enough
 * for the Studio; wire its renderer in the web app's page builder.
 */
export const blockSchemas = [
  heroSchema,
  ctaSchema,
  featureCardsIconSchema,
  faqAccordionSchema,
  logoCloudSchema,
  socialGridSchema,
  showcaseGridSchema,
  richTextBlockSchema,
  subscribeNewsletterSchema,
  videoFeatureSchema,
];

export type BlockTypeName = (typeof blockSchemas)[number]["name"];

export const blockTypeNames = blockSchemas.map(({ name }) => name);
