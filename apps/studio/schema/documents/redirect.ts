import {
  isRedirectDestination,
  isRedirectSource,
} from "@repo/internationalization/redirects";
import { TrendingUpDown } from "lucide-react";
import type { SanityClient, SlugValue } from "sanity";
import { defineField, defineType, getDraftId, getPublishedId } from "sanity";

import { API_VERSION } from "../../lib/constants";
import { siteField } from "../fields/site";

interface Redirect {
  site?: string;
  source: SlugValue;
  destination: SlugValue;
  permanent: boolean;
  status: string;
}

const validateRedirectLoop = async (
  client: SanityClient,
  { slug, _id, site }: { _id: string; slug: string; site?: string }
) => {
  const id = getPublishedId(_id);
  const draftId = getDraftId(_id);
  const existingRedirect = await client.fetch(
    `*[_type == "redirect" && site == $site && !(_id in $ids) && (source.current == $slug || destination.current == $slug)]`,
    { ids: [id, draftId], site: site ?? null, slug }
  );
  return existingRedirect.length !== 0;
};

/**
 * A path redirect for one site. Paths are public paths as visitors see them,
 * so a localized path keeps its locale prefix (`/de/alt` → `/de/neu`).
 * Applied at build time through next.config redirects, matched by host.
 */
export const redirect = defineType({
  description: "Redirect for next.config.js",
  fields: [
    siteField,
    defineField({
      description: "Enable or disable this redirect",
      initialValue: "active",
      name: "status",
      options: {
        layout: "radio",
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
        ],
      },
      type: "string",
    }),
    defineField({
      description: "The path to redirect from",
      name: "source",
      options: {
        isUnique: () => true,
      },
      type: "slug",
      validation: (rule) => [
        rule.required(),
        rule.custom<SlugValue>(async (value, { document, getClient }) => {
          const source = value?.current;
          if (!(value && source)) {
            return "Can't be blank";
          }
          if (!isRedirectSource(source)) {
            return "Enter a public path such as /old-page: it must start with a /, and may only contain letters, numbers, hyphens, dots and slashes.";
          }

          const destination = (document?.destination as SlugValue)?.current;
          if (source === destination) {
            return "Source and destination cannot be the same URL";
          }
          const client = getClient({ apiVersion: API_VERSION });
          const existingRedirect = await validateRedirectLoop(client, {
            _id: document?._id ?? "",
            site: (document as Redirect | undefined)?.site,
            slug: source,
          });
          if (existingRedirect) {
            return "This would create a redirect loop - a redirect already exists from the source";
          }
          return true;
        }),
      ],
    }),
    defineField({
      description: "The path to redirect to",
      name: "destination",
      options: {
        isUnique: () => true,
      },
      type: "slug",
      validation: (rule) => [
        rule.required(),
        rule.custom<SlugValue>(async (value, { getClient, document }) => {
          const destination = value?.current;
          if (!(value && destination)) {
            return "Can't be blank";
          }
          if (!isRedirectDestination(destination)) {
            return "Enter a public path such as /new-page (a ?query is allowed): it must start with a /, and may only contain letters, numbers, hyphens, dots and slashes.";
          }
          const source = (document as unknown as Redirect)?.source?.current;
          if (destination === source) {
            return "Source and destination cannot be the same URL";
          }
          const client = getClient({ apiVersion: API_VERSION });
          const existingRedirect = await validateRedirectLoop(client, {
            _id: document?._id ?? "",
            site: (document as Redirect | undefined)?.site,
            slug: destination,
          });
          if (existingRedirect) {
            return "This would create a redirect loop - a redirect already exists from the destination";
          }
          return true;
        }),
      ],
    }),
    defineField({
      description:
        "Whether this is a permanent (301) or temporary (302) redirect",
      initialValue: "true",
      name: "permanent",
      options: {
        layout: "radio",
        list: [
          { title: "Permanent (301)", value: "true" },
          { title: "Temporary (302)", value: "false" },
        ],
      },
      type: "string",
    }),
  ],
  icon: TrendingUpDown,
  name: "redirect",
  preview: {
    prepare: ({ title, subtitle, permanent, status, site }) => ({
      media: TrendingUpDown,
      subtitle: `${site ?? "no site"} · ${permanent === "true" ? "Permanent" : "Temporary"}, ${status}`,
      title: `${title ?? "Untitled"} to ${subtitle ?? "Untitled"}`,
    }),
    select: {
      permanent: "permanent",
      site: "site",
      status: "status",
      subtitle: "destination.current",
      title: "source.current",
    },
  },
  title: "Redirect",
  type: "document",
});
