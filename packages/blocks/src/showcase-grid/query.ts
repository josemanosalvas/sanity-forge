import { imageFields } from "../lib/groq-fragments";

export const showcaseGridGroqProjection = `
  _type == "showcaseGrid" => {
    ...,
    "items": array::compact(items[]{
      _key,
      siteName,
      url,
      category,
      "screenshot": screenshot{
        ${imageFields}
      },
      "attributionLogo": attributionLogo{
        ${imageFields}
      },
      featured
    })
  }
` as const;
