import { imageFields, urlFragment } from "../lib/groq-fragments";

export const socialGridGroqProjection = `
  _type == "socialGrid" => {
    ...,
    "socials": array::compact(socials[]{
      ...,
      ${urlFragment},
      "logo": logo{
        ${imageFields}
      }
    })
  }
` as const;
