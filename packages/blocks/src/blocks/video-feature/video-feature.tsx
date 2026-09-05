import { BlockHeader } from "../../components/block-header";
import { MuxVideo } from "../../components/mux-video";
import type { MuxVideoOptions } from "../../components/mux-video";
import type { RichTextValue } from "../../components/rich-text";
import { RichText } from "../../components/rich-text";
import { muxPlaybackId } from "../../lib/mux";
import type { MuxVideoData } from "../../lib/mux";

export interface VideoFeatureVideo extends MuxVideoOptions {
  asset?: MuxVideoData | null;
}

export interface VideoFeatureProps {
  caption?: string | null;
  eyebrow?: string | null;
  richText?: RichTextValue;
  title?: string | null;
  video?: VideoFeatureVideo | null;
}

export const VideoFeature = ({
  caption,
  eyebrow,
  richText,
  title,
  video,
}: Readonly<VideoFeatureProps>) => {
  // Keep published copy visible if the video asset becomes unavailable.
  const hasVideo = Boolean(muxPlaybackId(video?.asset));

  return (
    <section className="block-section" id="video-feature">
      <div className="container grid gap-10">
        <BlockHeader eyebrow={eyebrow} title={title}>
          <RichText
            className="body-text text-muted-foreground max-w-2xl"
            richText={richText}
          />
        </BlockHeader>
        {(hasVideo || caption) && (
          <figure className="grid gap-3">
            <MuxVideo options={video} title={title} video={video?.asset} />
            {caption && (
              <figcaption className="text-muted-foreground text-sm">
                {caption}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </section>
  );
};
