"use client";

import { cn } from "cn";
import { Play } from "lucide-react";
import { stegaClean } from "next-sanity";
import dynamic from "next/dynamic";
import { useState } from "react";

import { muxAspectRatio, muxPlaybackId, muxThumbnailUrl } from "../lib/mux";
import type { MuxVideoData } from "../lib/mux";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

const POSTER_WIDTH = 1200;

/** Controls stay visible so autoplaying clips can be paused. */
export interface MuxVideoOptions {
  autoPlay?: boolean | null;
  loop?: boolean | null;
}

export interface MuxVideoProps {
  className?: string;
  options?: MuxVideoOptions | null;
  title?: string | null;
  video?: MuxVideoData | null;
}

/** Load the player on play or autoplay; keep the poster visible while it loads. */
export const MuxVideo = ({
  className,
  options,
  title,
  video,
}: Readonly<MuxVideoProps>) => {
  const autoPlay = Boolean(options?.autoPlay);
  // Derive autoplay from props so Presentation edits take effect without remounting.
  const [pressed, setPressed] = useState(false);
  const playing = autoPlay || pressed;

  const playbackId = muxPlaybackId(video);
  if (!playbackId) {
    return null;
  }

  const poster = muxThumbnailUrl(playbackId, video?.thumbTime, POSTER_WIDTH);
  const videoTitle = stegaClean(title) ?? undefined;

  return (
    // Reserve the video height while the dynamic player loads.
    <div
      className={cn("bg-muted relative w-full overflow-hidden", className)}
      style={{ aspectRatio: muxAspectRatio(video) }}
    >
      {poster && (
        // oxlint-disable-next-line next/no-img-element -- Mux serves the still already sized and encoded; next/image would add a proxy hop
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          src={poster}
        />
      )}
      {playing ? (
        <MuxPlayer
          autoPlay={autoPlay ? "muted" : "any"}
          className="absolute inset-0 size-full"
          // Enable Mux Data only after adding consent handling.
          disableTracking
          loop={Boolean(options?.loop)}
          // Strip Studio document metadata before sending the title to Mux.
          metadata={videoTitle ? { video_title: videoTitle } : undefined}
          muted={autoPlay}
          placeholder={poster}
          playbackId={playbackId}
          streamType="on-demand"
          thumbnailTime={video?.thumbTime ?? undefined}
        />
      ) : (
        <button
          aria-label={videoTitle ? `Play video: ${videoTitle}` : "Play video"}
          className="group absolute inset-0 grid place-items-center"
          onClick={() => setPressed(true)}
          type="button"
        >
          <span className="bg-background/80 text-foreground group-hover:bg-background grid size-14 place-items-center rounded-full backdrop-blur transition group-hover:scale-105">
            <Play className="size-6 translate-x-px fill-current" />
          </span>
        </button>
      )}
    </div>
  );
};
