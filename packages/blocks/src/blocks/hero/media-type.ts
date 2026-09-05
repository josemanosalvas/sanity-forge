import { stegaClean } from "next-sanity";

import { muxPlaybackId } from "../../lib/mux";
import type { MuxVideoData } from "../../lib/mux";

/** Mux MP4 requires static renditions on the asset; HLS uses the adaptive player. */
export type HeroMediaType = "mux" | "mux-mp4" | "sanity";

export interface HeroMediaSelection {
  mediaType?: string | null;
  mux?: MuxVideoData | null;
}

const PATHS = new Set<HeroMediaType>(["mux", "mux-mp4", "sanity"]);

export const mediaTypeOf = (
  variant?: HeroMediaSelection | null
): HeroMediaType => {
  const explicit = stegaClean(variant?.mediaType) as HeroMediaType;
  if (PATHS.has(explicit)) {
    return explicit;
  }
  // Infer legacy documents without an explicit selection.
  return muxPlaybackId(variant?.mux) ? "mux" : "sanity";
};

export const isMuxPath = (type: HeroMediaType): boolean =>
  type === "mux" || type === "mux-mp4";
