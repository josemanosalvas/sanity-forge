/** Clean stega before using CMS values in URLs or CSS. */

import { stegaClean } from "next-sanity";

/** Shape projected by muxVideoFields in ./groq-fragments. */
export interface MuxVideoData {
  /** Mux's own aspect ratio for the source, in `16:9` form. */
  aspectRatio?: string | null;
  playbackId?: string | null;
  /** Mux's playback policy for that ID: `public`, `signed`, or `drm`. */
  policy?: string | null;
  /** `preparing`, `ready`, or `errored`. See `muxPlaybackId`. */
  status?: string | null;
  /** Seconds into the clip: the poster frame the editor scrubbed to. */
  thumbTime?: number | null;
  title?: string | null;
}

/**
 * Only public playback IDs are supported; signed/DRM IDs require a JWT.
 * Do not require status "ready": the Studio poll can stop at "preparing"
 * when the editor closes the tab, even if encoding succeeds.
 */
export const muxPlaybackId = (video?: MuxVideoData | null): string | null => {
  if (
    !video?.playbackId ||
    stegaClean(video.status) === "errored" ||
    stegaClean(video.policy) !== "public"
  ) {
    return null;
  }
  return stegaClean(video.playbackId);
};

/** Mux's `16:9` as the `16/9` CSS `aspect-ratio` accepts. Reserves the box. */
export const muxAspectRatio = (video?: MuxVideoData | null): string => {
  const ratio = stegaClean(video?.aspectRatio);
  return ratio ? ratio.replace(":", "/") : "16/9";
};

export const muxThumbnailUrl = (
  playbackId?: string | null,
  thumbTime?: number | null,
  width?: number
): string | undefined => {
  if (!playbackId) {
    return undefined;
  }
  const params = new URLSearchParams();
  // `time=0` is a real frame choice, hence the type check.
  if (typeof thumbTime === "number") {
    params.set("time", String(thumbTime));
  }
  // Unasked, Mux serves the still at the source resolution — 4K for a poster.
  if (width) {
    params.set("width", String(width));
  }
  const query = params.size ? `?${params}` : "";
  return `https://image.mux.com/${playbackId}/thumbnail.webp${query}`;
};

export type MuxMp4Resolution = "1080p" | "720p" | "480p" | "270p";

/**
 * Requires static renditions enabled on the Mux asset. Missing renditions
 * return 404; callers must retain a poster or another fallback.
 */
export const muxMp4Url = (
  playbackId?: string | null,
  resolution: MuxMp4Resolution = "1080p"
): string | undefined => {
  if (!playbackId) {
    return undefined;
  }
  return `https://stream.mux.com/${playbackId}/${resolution}.mp4`;
};
