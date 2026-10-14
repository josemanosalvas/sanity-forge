export const imageFields = `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  "alt": coalesce(alt, asset->altText, caption),
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

export const imageFragment = `
  image {
    ${imageFields}
  }
` as const;

/**
 * Public href for an internal reference, such as `url.internal`.
 * References to another site's page return null. This also handles legacy
 * links in shared FAQs and pages moved between sites after linking.
 * The target page supplies the language. Only non-default locales get a prefix.
 * Queries must pass `$site` and `$defaultLocale`.
 */
export const localizedInternalHref = <const Ref extends string>(ref: Ref) =>
  `select(
  ${ref}->site != $site => null,
  ${ref}->language == $defaultLocale => ${ref}->slug.current,
  ${ref}->slug.current == "/" => "/" + ${ref}->language,
  "/" + ${ref}->language + ${ref}->slug.current
)` as const;

const customLinkFragment = `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => ${localizedInternalHref("internal")},
      type == "external" => external,
      "#"
    ),
  }
` as const;

export const markDefsFragment = `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
` as const;

export const richTextFragment = `
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

export const urlFragment = `
  "openInNewTab": url.openInNewTab,
  "href": select(
    url.type == "internal" => ${localizedInternalHref("url.internal")},
    url.type == "external" => url.external,
    url.href
  )
` as const;

export const buttonsFragment = `
  buttons[]{
    text,
    variant,
    _key,
    _type,
    ${urlFragment}
  }
` as const;

/** `mux.video` holds only a reference; everything playable is on the asset. */
export const muxVideoFields = `
  "playbackId": asset->playbackId,
  "policy": asset->data.playback_ids[0].policy,
  "aspectRatio": asset->data.aspect_ratio,
  "status": asset->status,
  "thumbTime": asset->thumbTime,
  "title": asset->filename
` as const;

/** The `muxVideoEmbedField` shape: the clip, plus how the editor wants it played. */
export const muxVideoEmbedFields = `
  asset {
    ${muxVideoFields}
  },
  autoPlay,
  loop
` as const;
