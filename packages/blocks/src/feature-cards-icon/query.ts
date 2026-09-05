import { richTextFragment } from "../internal/groq-fragments";

export const featureCardsIconGroqProjection = `
  _type == "featureCardsIcon" => {
    ...,
    ${richTextFragment},
    "cards": array::compact(cards[]{
      ...,
      ${richTextFragment},
    })
  }
` as const;
