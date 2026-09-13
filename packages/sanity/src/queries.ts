import {
  buttonsFragment,
  imageFields,
  imageFragment,
  urlFragment,
} from "@repo/blocks/lib/groq-fragments";
import { pageBuilderProjection } from "@repo/blocks/queries";
import { defineQuery } from "next-sanity";

/** TypeGen resolves `${}` fragment interpolation; do not use string concatenation. */

/** A field-level localized value with fallback to the site's default locale. */
const localized = <const Field extends string>(field: Field) =>
  `coalesce(
  ${field}[language == $locale][0].value,
  ${field}[language == $defaultLocale][0].value
)` as const;

/** Include site so callers can exclude translations moved to another site. */
const translationsFragment = `
  "translations": *[_type == "translation.metadata" && references(^._id)][0]
    .translations[defined(value)]{
      language,
      "site": value->site,
      "slug": value->slug.current
    }
` as const;

/**
 * `ogImage` stays an image object because hotspot and crop live there, not on
 * the asset; the caller sizes it. The fallback keys off a resolved asset, so an
 * override left holding only framing cannot blank the card.
 */
const seoFragment = `
  seoTitle,
  seoDescription,
  seoNoIndex,
  ogTitle,
  ogDescription,
  "ogImage": select(
    defined(seoImage.asset) => seoImage,
    defined(image.asset) => image,
    null
  ){
    ${imageFields}
  }
` as const;

export const pageQuery = defineQuery(`
  *[_type == "page" && site == $site && language == $locale && slug.current == $path][0]{
    _id,
    _type,
    _updatedAt,
    site,
    language,
    title,
    description,
    "slug": slug.current,
    ${imageFragment},
    ${seoFragment},
    ${pageBuilderProjection},
    ${translationsFragment}
  }
`);

export const pageMetadataQuery = defineQuery(`
  *[_type == "page" && site == $site && language == $locale && slug.current == $path][0]{
    _id,
    _type,
    site,
    language,
    title,
    description,
    "slug": slug.current,
    ${seoFragment},
    ${translationsFragment}
  }
`);

export const pagePathsQuery = defineQuery(`
  *[_type == "page" && defined(site) && defined(language) && defined(slug.current)]{
    site,
    language,
    "slug": slug.current
  }
`);

export const sitemapQuery = defineQuery(`
  *[_type == "page" && site == $site && defined(slug.current) && seoNoIndex != true]{
    language,
    "slug": slug.current,
    "lastModified": _updatedAt,
    ${translationsFragment}
  }
`);

/**
 * Navigation, footer and settings are singletons read by the ID their scope
 * derives (`@repo/blocks/lib/singletons`), so the Studio and the site agree on
 * the document; the scope filters stay as a guard.
 */
export const navigationQuery = defineQuery(`
  *[_type == "navigation" && _id == $id && site == $site && language == $locale][0]{
    _id,
    columns[]{
      _key,
      _type == "navigationColumn" => {
        "type": "column",
        title,
        links[]{
          _key,
          name,
          icon,
          description,
          ${urlFragment}
        }
      },
      _type == "navigationLink" => {
        "type": "link",
        name,
        ${urlFragment}
      }
    },
    ${buttonsFragment}
  }
`);

export const footerQuery = defineQuery(`
  *[_type == "footer" && _id == $id && site == $site && language == $locale][0]{
    _id,
    subtitle,
    columns[]{
      _key,
      title,
      links[]{
        _key,
        name,
        ${urlFragment}
      }
    },
    copyright,
    credits[]{
      _key,
      label,
      url,
      logo {
        ${imageFields}
      }
    }
  }
`);

export const settingsQuery = defineQuery(`
  *[_type == "settings" && _id == $id && site == $site][0]{
    _id,
    _type,
    site,
    "siteTitle": ${localized("siteTitle")},
    "siteDescription": ${localized("siteDescription")},
    logos {
      logo {
        ${imageFields}
      },
      logoDark {
        ${imageFields}
      },
      footerLogo {
        ${imageFields}
      }
    },
    favicon {
      "svg": svg.asset->url,
      "ico": ico.asset->url
    },
    ogImage {
      ${imageFields}
    },
    contactEmail,
    socialLinks {
      linkedin,
      facebook,
      twitter,
      instagram,
      youtube,
      reddit
    }
  }
`);

export const redirectsQuery = defineQuery(`
  *[_type == "redirect" && status == "active" && defined(site) && defined(source.current) && defined(destination.current)]{
    site,
    "source": source.current,
    "destination": destination.current,
    "permanent": permanent == "true"
  }
`);
