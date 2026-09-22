import {
  isRedirectDestination,
  isRedirectSource,
} from "@repo/internationalization/redirects";
import { TrendingUpDown } from "lucide-react";
import type { SanityClient, SlugValue, ValidationContext } from "sanity";
import { defineField, defineType, getPublishedId } from "sanity";

import { API_VERSION } from "../../lib/constants";
import { siteField } from "../fields/site";

interface Redirect {
  destination?: SlugValue;
  permanent?: string;
  site?: string;
  source?: SlugValue;
  status?: string;
}

interface ConflictingRedirect {
  destination: string | null;
  source: string | null;
}

/** A path another redirect already starts from, or already points at. */
const TOUCHES_PATH = "source.current == $path || destination.current == $path";

/** A path another redirect already sends visitors away from. */
const REDIRECTS_AWAY_FROM_PATH = "source.current == $path";

/**
 * The first other redirect of this site whose paths meet `match`. Every version
 * of this document is excluded, so a redirect opened in a content release does
 * not conflict with its own published row.
 */
const findConflictingRedirect = (
  client: SanityClient,
  {
    _id,
    match,
    path,
    site,
  }: { _id: string; match: string; path: string; site?: string }
) =>
  client.fetch<ConflictingRedirect | null>(
    `*[_type == "redirect" && site == $site && !sanity::versionOf($published) && (${match})][0]{"destination": destination.current, "source": source.current}`,
    { path, published: getPublishedId(_id), site: site ?? null },
    { perspective: "raw" }
  );

/**
 * `source` rule: the path visitors request. A second redirect from the same
 * source makes which one wins arbitrary, and one pointing *at* this source
 * (X → source → destination) costs visitors a second round trip.
 */
export const redirectSourceRule = async (
  value: SlugValue | undefined,
  { document, getClient }: Pick<ValidationContext, "document" | "getClient">
): Promise<string | true> => {
  const source = value?.current;
  if (!source) {
    return "Can't be blank";
  }
  if (!isRedirectSource(source)) {
    return "Enter a public path such as /old-page: it must start with a /, and may only contain letters, numbers, hyphens, dots and slashes.";
  }
  const redirectDocument = document as Redirect | undefined;
  if (source === redirectDocument?.destination?.current) {
    return "Source and destination cannot be the same URL";
  }
  const conflict = await findConflictingRedirect(
    getClient({ apiVersion: API_VERSION }),
    {
      _id: document?._id ?? "",
      match: TOUCHES_PATH,
      path: source,
      site: redirectDocument?.site,
    }
  );
  if (!conflict) {
    return true;
  }
  return conflict.source === source
    ? `Another redirect already sends ${source} to ${conflict.destination}. Edit that one instead of adding a second.`
    : `${conflict.source} already points at this path, so visitors would be redirected twice. Send ${conflict.source} to this redirect's destination instead.`;
};

/**
 * `destination` rule: where visitors land. Several sources may share one
 * destination - that is how a set of old paths is consolidated - but a
 * destination that is itself another redirect's source adds a second hop.
 */
export const redirectDestinationRule = async (
  value: SlugValue | undefined,
  { document, getClient }: Pick<ValidationContext, "document" | "getClient">
): Promise<string | true> => {
  const destination = value?.current;
  if (!destination) {
    return "Can't be blank";
  }
  if (!isRedirectDestination(destination)) {
    return "Enter a public path such as /new-page (a ?query is allowed): it must start with a /, and may only contain letters, numbers, hyphens, dots and slashes.";
  }
  const redirectDocument = document as Redirect | undefined;
  if (destination === redirectDocument?.source?.current) {
    return "Source and destination cannot be the same URL";
  }
  const conflict = await findConflictingRedirect(
    getClient({ apiVersion: API_VERSION }),
    {
      _id: document?._id ?? "",
      match: REDIRECTS_AWAY_FROM_PATH,
      path: destination,
      site: redirectDocument?.site,
    }
  );
  return conflict
    ? `This path is itself redirected, to ${conflict.destination}, so visitors would be redirected twice. Point this redirect at ${conflict.destination} instead.`
    : true;
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
      // The build filters on `status == "active"`, so a missing status drops
      // the redirect silently.
      validation: (rule) => rule.required(),
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
        rule.custom<SlugValue>(redirectSourceRule),
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
        rule.custom<SlugValue>(redirectDestinationRule),
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
      // The build compares `permanent == "true"`, so a missing value quietly
      // becomes a 302.
      validation: (rule) => rule.required(),
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
