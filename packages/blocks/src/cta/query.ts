import {
  buttonsFragment,
  imageFragment,
  richTextFragment,
  urlFragment,
} from "../internal/groq-fragments";

export const ctaGroqProjection = `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    usedByTeams {
      ...,
      "logos": array::compact(logos[]{
        ...,
        ${urlFragment},
        ${imageFragment},
      })
    },
  }
` as const;
