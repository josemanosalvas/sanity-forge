"use client";

import { useMediaQuery } from "@repo/ui/hooks/use-media-query";
import { useMounted } from "@repo/ui/hooks/use-mounted";
import { cn } from "cn";
import { stegaClean } from "next-sanity";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { SanityImageData } from "../../components/sanity-image";
import { muxMp4Url, muxPlaybackId } from "../../lib/mux";
import type { MuxVideoData } from "../../lib/mux";
import { isMuxPath, mediaTypeOf } from "./media-type";

export type { HeroMediaType } from "./media-type";
export { isMuxPath, mediaTypeOf } from "./media-type";

// Keep the HLS player out of file-backed and MP4 backgrounds.
const MuxVideo = dynamic(() => import("@mux/mux-video-react"), { ssr: false });

export interface HeroVideoVariant {
  /** Which path renders. Absent on anything authored before the toggle. */
  mediaType?: string | null;
  mux?: MuxVideoData | null;
  /** Full-resolution HEVC for Safari, which decodes AV1 only on recent chips. */
  hevc?: string | null;
  /** Phone-sized clips. Optional — the desktop set is used when absent. */
  mobileWebm?: string | null;
  poster?: SanityImageData | null;
  webm?: string | null;
}

export interface HeroVideoData {
  light?: HeroVideoVariant | null;
  dark?: HeroVideoVariant | null;
}

const BACKGROUND_CLASS =
  "pointer-events-none size-full object-cover object-[50%_45%] transition-opacity duration-700 ease-out";

const hasFiles = (variant?: HeroVideoVariant | null): boolean =>
  Boolean(variant?.webm || variant?.hevc || variant?.mobileWebm);

const hasSource = (variant?: HeroVideoVariant | null): boolean =>
  isMuxPath(mediaTypeOf(variant))
    ? Boolean(muxPlaybackId(variant?.mux))
    : hasFiles(variant);

const sourceKeyOf = (variant?: HeroVideoVariant | null): string | null => {
  if (isMuxPath(mediaTypeOf(variant))) {
    return muxPlaybackId(variant?.mux);
  }
  return (
    stegaClean(variant?.webm ?? variant?.hevc ?? variant?.mobileWebm) ?? null
  );
};

export type DeliveryRung = "1080p" | "720p" | "480p";

interface Connection {
  effectiveType?: string;
  saveData?: boolean;
}

/** Browsers without Network Information API support use viewport width. */
export const rungFor = (
  width: number,
  connection?: Connection
): DeliveryRung => {
  if (
    connection?.saveData ||
    /(?:^|-)2g$/u.test(connection?.effectiveType ?? "")
  ) {
    return "480p";
  }
  return width >= 1280 ? "1080p" : "720p";
};

/**
 * Choose when rendering the mounted video; do not subscribe to resize
 * to avoid restarting downloads as the viewport changes.
 */
const deliveryRung = (): DeliveryRung => {
  const { connection } = navigator as Navigator & { connection?: Connection };
  return rungFor(window.innerWidth, connection);
};

const pickSources = (variant: HeroVideoVariant | null, rung: DeliveryRung) => {
  // Use the smaller WebM on narrow screens or constrained connections.
  const webm =
    rung === "1080p" ? variant?.webm : (variant?.mobileWebm ?? variant?.webm);
  return {
    hevc: stegaClean(variant?.hevc) ?? undefined,
    webm: stegaClean(webm) ?? undefined,
  };
};

type BackgroundProps = Readonly<{
  className?: string;
  onReady: () => void;
  variant: HeroVideoVariant;
}>;

const MuxBackground = ({ className, onReady, variant }: BackgroundProps) => {
  const rung = deliveryRung();
  const playbackId = muxPlaybackId(variant.mux);
  if (!playbackId) {
    return null;
  }

  // Mux maxResolution starts at 720p. On slow connections, omit descending
  // rendition order so adaptive playback can select lower resolutions.
  const thin = rung === "480p";

  return (
    <MuxVideo
      aria-hidden
      autoPlay
      className={className}
      disablePictureInPicture
      disableRemotePlayback
      // Enable Mux Data only after adding consent handling.
      disableTracking
      key={playbackId}
      loop
      maxResolution={thin ? "720p" : rung}
      muted
      onCanPlay={onReady}
      playbackId={playbackId}
      playsInline
      preload="auto"
      renditionOrder={thin ? undefined : "desc"}
      streamType="on-demand"
      tabIndex={-1}
    />
  );
};

// Progressive MP4 uses native playback; resolution is selected at mount.
const MuxMp4Background = ({ className, onReady, variant }: BackgroundProps) => {
  const rung = deliveryRung();
  const playbackId = muxPlaybackId(variant.mux);
  const src = muxMp4Url(playbackId, rung);
  if (!src) {
    return null;
  }

  return (
    <video
      aria-hidden="true"
      autoPlay
      className={className}
      disablePictureInPicture
      disableRemotePlayback
      key={src}
      loop
      muted
      onCanPlay={onReady}
      playsInline
      preload="auto"
      src={src}
      tabIndex={-1}
    />
  );
};

const FileBackground = ({ className, onReady, variant }: BackgroundProps) => {
  const rung = deliveryRung();
  const sources = pickSources(variant, rung);
  if (!(sources.webm || sources.hevc)) {
    return null;
  }

  return (
    <video
      aria-hidden="true"
      autoPlay
      className={className}
      disablePictureInPicture
      disableRemotePlayback
      key={sources.webm ?? sources.hevc}
      loop
      muted
      onCanPlay={onReady}
      playsInline
      preload="auto"
      tabIndex={-1}
    >
      {sources.webm && (
        <source src={sources.webm} type='video/webm; codecs="av01.0.05M.08"' />
      )}
      {/* Declare HEVC so browsers that cannot decode it skip this source. */}
      {sources.hevc && (
        <source src={sources.hevc} type='video/mp4; codecs="hvc1"' />
      )}
    </video>
  );
};

/**
 * Mount after hydration to respect the manual theme toggle. Keep the poster
 * visible until the selected clip can play.
 */
export const HeroVideo = ({
  className,
  video,
}: Readonly<{ className?: string; video?: HeroVideoData | null }>) => {
  const { resolvedTheme } = useTheme();
  // Keep the poster until the browser resolves the motion preference.
  const prefersReducedMotion =
    useMediaQuery("(prefers-reduced-motion: reduce)") ?? true;
  const mounted = useMounted();
  // Readiness belongs to a source and resets when the theme changes.
  const [readyKey, setReadyKey] = useState<string | null>(null);

  const variant =
    resolvedTheme === "dark" && hasSource(video?.dark)
      ? video?.dark
      : video?.light;
  const sourceKey = sourceKeyOf(variant);

  if (!(mounted && variant && hasSource(variant)) || prefersReducedMotion) {
    return null;
  }

  const shared = cn(
    BACKGROUND_CLASS,
    readyKey === sourceKey ? "opacity-100" : "opacity-0",
    className
  );
  const onReady = () => setReadyKey(sourceKey);
  const props = { className: shared, onReady, variant };

  switch (mediaTypeOf(variant)) {
    case "mux": {
      return <MuxBackground {...props} />;
    }
    case "mux-mp4": {
      return <MuxMp4Background {...props} />;
    }
    default: {
      return <FileBackground {...props} />;
    }
  }
};
