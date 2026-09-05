import {
  muxVideoEmbedFields,
  richTextFragment,
} from "../internal/groq-fragments";

export const videoFeatureGroqProjection = `
  _type == "videoFeature" => {
    ...,
    ${richTextFragment},
    video {
      ${muxVideoEmbedFields}
    },
  }
` as const;
