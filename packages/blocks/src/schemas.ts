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

/**
 * Every page-builder block schema, in the order the Studio's insert menu
 * shows them. The page builder array type is derived from this list, so
 * adding a block here is enough for the Studio; wire its renderer in the web
 * app's page builder. Individual schemas are imported from `@repo/blocks/<block>/schema`.
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
