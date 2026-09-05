import { ctaSchema } from "./blocks/cta/schema";
import { faqAccordionSchema } from "./blocks/faq-accordion/schema";
import { featureCardsIconSchema } from "./blocks/feature-cards-icon/schema";
import { heroSchema } from "./blocks/hero/schema";
import { logoCloudSchema } from "./blocks/logo-cloud/schema";
import { richTextBlockSchema } from "./blocks/rich-text-block/schema";
import { showcaseGridSchema } from "./blocks/showcase-grid/schema";
import { socialGridSchema } from "./blocks/social-grid/schema";
import { subscribeNewsletterSchema } from "./blocks/subscribe-newsletter/schema";
import { videoFeatureSchema } from "./blocks/video-feature/schema";

/** Order in the Studio insert menu. Register renderers separately in the web app. */
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
