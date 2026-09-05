import { imageFields, markDefsFragment } from "../../lib/groq-fragments";

export const subscribeNewsletterGroqProjection = `
  _type == "subscribeNewsletter" => {
    _type,
    _key,
    title,
    "subTitle": subTitle[]{
      ...,
      ${markDefsFragment}
    },
    "helperText": helperText[]{
      ...,
      ${markDefsFragment}
    },
    "testimonial": testimonial{
      eyebrow,
      authorName,
      authorRole,
      "quote": quote[]{
        ...,
        ${markDefsFragment}
      },
      "authorImage": authorImage{
        ${imageFields}
      }
    }
  }
` as const;
