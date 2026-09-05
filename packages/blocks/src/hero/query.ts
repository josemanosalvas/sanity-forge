import {
  buttonsFragment,
  imageFields,
  muxVideoFields,
  richTextFragment,
} from "../lib/groq-fragments";

/**
 * Both delivery paths, always. `mediaType` decides which one renders, but the
 * projection carries the other too — an editor flipping the toggle in
 * Presentation would otherwise watch the background vanish until the query
 * re-ran. File assets carry no LQIP or dimensions, so only the URL is worth
 * resolving; the poster keeps the full image shape so it renders through
 * SanityImage.
 */
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
