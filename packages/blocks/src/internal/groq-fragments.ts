export const imageFields = /* groq */ `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  "alt": coalesce(
    alt,
    asset->altText,
    caption,
    asset->originalFilename,
    "untitled"
  ),
  hotspot {
    x,
    y
  },
  crop {
    bottom,
    left,
    right,
    top
  }
` as const;

export const imageFragment = /* groq */ `
  image {
    ${imageFields}
  }
` as const;

/**
 * Public href for an internal page reference at `ref` (e.g. `url.internal`).
 * Pages are localized per document, so the referenced page carries its own
 * language; the site's default locale stays unprefixed, others get `/{lang}`.
 * Queries using it must pass `$defaultLocale`.
 */
export const localizedInternalHref = <const Ref extends string>(ref: Ref) =>
  /* groq */ `select(
  ${ref}->language == $defaultLocale => ${ref}->slug.current,
  ${ref}->slug.current == "/" => "/" + ${ref}->language,
  "/" + ${ref}->language + ${ref}->slug.current
)` as const;

const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => ${localizedInternalHref("internal")},
      type == "external" => external,
      "#"
    ),
  }
` as const;

export const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
` as const;

export const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    },
    _type == "table" => {
      ...,
      rows[]{
        ...,
        cells[]{
          ...,
          value[]{
            ...,
            _type == "block" => {
              ...,
              ${markDefsFragment}
            }
          }
        }
      }
    }
  }
` as const;

export const buttonsFragment = /* groq */ `
  buttons[]{
    text,
    variant,
    _key,
    _type,
    "openInNewTab": url.openInNewTab,
    "href": select(
      url.type == "internal" => ${localizedInternalHref("url.internal")},
      url.type == "external" => url.external,
      url.href
    ),
  }
` as const;

export const urlFragment = /* groq */ `
  "openInNewTab": url.openInNewTab,
  "href": select(
    url.type == "internal" => ${localizedInternalHref("url.internal")},
    url.type == "external" => url.external,
    url.href
  )
` as const;

/** `mux.video` holds only a reference; everything playable is on the asset. */
export const muxVideoFields = /* groq */ `
  "playbackId": asset->playbackId,
  "policy": asset->data.playback_ids[0].policy,
  "aspectRatio": asset->data.aspect_ratio,
  "status": asset->status,
  "thumbTime": asset->thumbTime,
  "title": asset->filename
` as const;

/** The `muxVideoEmbedField` shape: the clip, plus how the editor wants it played. */
export const muxVideoEmbedFields = /* groq */ `
  asset {
    ${muxVideoFields}
  },
  autoPlay,
  loop
` as const;
