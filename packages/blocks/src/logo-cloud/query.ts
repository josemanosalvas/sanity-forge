import { imageFragment, urlFragment } from "../internal/groq-fragments";

export const logoCloudGroqProjection = `
  _type == "logoCloud" => {
    ...,
    "logos": array::compact(logos[]{
      ...,
      ${urlFragment},
      ${imageFragment},
    })
  }
` as const;
