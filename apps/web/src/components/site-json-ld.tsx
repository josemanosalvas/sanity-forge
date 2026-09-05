import type { DynamicFetchOptions } from "@repo/sanity/live";
import { JsonLd } from "@repo/seo/json-ld";
import type { Organization, WebSite } from "@repo/seo/json-ld";
import { canonicalOrigin } from "@repo/seo/route";
import { stegaClean } from "next-sanity";

import { fetchSettings } from "@/lib/content";
import { toQueryParams } from "@/lib/site-context";
import type { SiteContext } from "@/types";

/** Organization + WebSite structured data for the current site. */
export const SiteJsonLd = async ({
  context,
  ...options
}: { context: SiteContext } & DynamicFetchOptions) => {
  "use cache";
  const settings = stegaClean(
    await fetchSettings({ ...toQueryParams(context), ...options })
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
    contactPoint: settings.contactEmail
      ? {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: settings.contactEmail,
        }
      : undefined,
    description: settings.siteDescription ?? undefined,
    name,
    sameAs: sameAs.length ? sameAs : undefined,
    url,
  };

  const website: WebSite = {
    "@type": "WebSite",
    description: settings.siteDescription ?? undefined,
    inLanguage: context.locale,
    name,
    publisher: organization,
    url,
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
};
