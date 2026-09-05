import { richTextFragment, urlFragment } from "../../lib/groq-fragments";

export const faqAccordionGroqProjection = `
  _type == "faqAccordion" => {
    ...,
    "eyebrow": coalesce(eyebrow, null),
    "categories": categories[]{
      _key,
      title,
      "faqs": array::compact(faqs[]->{
        title,
        _id,
        _type,
        ${richTextFragment}
      })
    },
    link{
      ...,
      ${urlFragment}
    }
  }
` as const;
