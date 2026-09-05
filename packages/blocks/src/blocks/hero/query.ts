import {
  buttonsFragment,
  imageFields,
  muxVideoFields,
  richTextFragment,
} from "../../lib/groq-fragments";

/** Project all sources so Presentation can switch delivery paths without missing fields. */
const videoVariantFields = `
  mediaType,
  mux {
    ${muxVideoFields}
  },
  "webm": webm.asset->url,
  "hevc": hevc.asset->url,
  "mobileWebm": mobileWebm.asset->url,
  poster {
    ${imageFields}
  }
` as const;

const heroVideoFragment = `
  video {
    light {
      ${videoVariantFields}
    },
    dark {
      ${videoVariantFields}
    }
  }
` as const;

export const heroGroqProjection = `
  _type == "hero" => {
    ...,
    ${heroVideoFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
` as const;
