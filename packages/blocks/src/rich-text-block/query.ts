import { richTextFragment } from "../internal/groq-fragments";

export const richTextBlockGroqProjection = `
  _type == "richTextBlock" => {
    ...,
    ${richTextFragment}
  }
` as const;
