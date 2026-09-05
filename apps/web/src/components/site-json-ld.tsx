import { PUBLISHED_FETCH_OPTIONS } from "@repo/sanity/live";
import { canonicalOrigin } from "@repo/seo";
import { JsonLd } from "@repo/seo/json-ld";
import type { Organization, WebSite } from "@repo/seo/json-ld";
import { stegaClean } from "next-sanity";

import { getSettings } from "@/lib/content";
import { toQueryParams } from "@/lib/site-context";
import type { SiteContext } from "@/types";

/** Organization + WebSite structured data for the current site. */
export async function SiteJsonLd({ context }: { context: SiteContext }) {
  const settings = stegaClean(
    await getSettings({ ...toQueryParams(context), ...PUBLISHED_FETCH_OPTIONS })
  );
  if (!settings) {
    return null;
  }

  const url = canonicalOrigin(context.site);
  const name = settings.siteTitle ?? context.site.name;
  const sameAs = Object.values(settings.socialLinks ?? {}).filter(
    (link): link is string => typeof link === "string" && link.length > 0
  );

  const organization: Organization = {
    "@type": "Organization",
    name,
    url,
    description: settings.siteDescription ?? undefined,
    contactPoint: settings.contactEmail
      ? {
          "@type": "ContactPoint",
          email: settings.contactEmail,
          contactType: "customer service",
        }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const website: WebSite = {
    "@type": "WebSite",
    name,
    url,
    inLanguage: context.locale,
    description: settings.siteDescription ?? undefined,
    publisher: organization,
  };

  return (
    <>
      <JsonLd
        code={{ "@context": "https://schema.org", ...organization }}
        id="organization-json-ld"
      />
      <JsonLd
        code={{ "@context": "https://schema.org", ...website }}
        id="website-json-ld"
      />
    </>
  );
}
