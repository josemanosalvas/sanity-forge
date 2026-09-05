import {
  muxVideoEmbedFields,
  richTextFragment,
} from "../../lib/groq-fragments";

export const videoFeatureGroqProjection = `
  _type == "videoFeature" => {
    ...,
    ${richTextFragment},
    video {
      ${muxVideoEmbedFields}
    },
  }
` as const;
