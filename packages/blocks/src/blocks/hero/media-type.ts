import { stegaClean } from "next-sanity";

import { muxPlaybackId } from "../../lib/mux";
import type { MuxVideoData } from "../../lib/mux";

/**
 * The three delivery paths a hero background can take.
 *
 * `mux` is the adaptive HLS ladder, which needs hls.js to drive it. `mux-mp4`
 * is the same asset served as one progressive file, which needs no player at
 * all but only exists where static renditions were enabled. `sanity` is the
 * hand-encoded set on the asset CDN.
 */
export type HeroMediaType = "mux" | "mux-mp4" | "sanity";

/**
 * The shape `mediaTypeOf` reads. Structural on purpose: the rendered hero's
 * variant and the Markdown serializer's both satisfy it without either
 * importing the other.
 */
export interface HeroMediaSelection {
  mediaType?: string | null;
  mux?: MuxVideoData | null;
}

// Infer the delivery path for documents without an explicit selection.
const PATHS = new Set<HeroMediaType>(["mux", "mux-mp4", "sanity"]);

export const mediaTypeOf = (
  variant?: HeroMediaSelection | null
): HeroMediaType => {
  const explicit = stegaClean(variant?.mediaType) as HeroMediaType;
  if (PATHS.has(explicit)) {
    return explicit;
  }
  return muxPlaybackId(variant?.mux) ? "mux" : "sanity";
};

/** Whether this path plays a Mux asset, however it is delivered. */
export const isMuxPath = (type: HeroMediaType): boolean =>
  type === "mux" || type === "mux-mp4";
