import { richTextFragment } from "../lib/groq-fragments";

export const richTextBlockGroqProjection = `
  _type == "richTextBlock" => {
    ...,
    ${richTextFragment}
  }
` as const;
