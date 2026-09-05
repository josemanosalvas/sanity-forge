import { getSite, isSiteKey } from "@repo/internationalization/sites";
import type { ValidationContext } from "sanity";

import { API_VERSION, SITE_SCOPED_TYPES } from "./constants";

type DocumentLike = { _type?: string; site?: unknown } | undefined;

/**
 * Where a link may point depends on who shows the document. A site-scoped
 * document (page, navigation, footer) is shown on one site and may reference
 * that site's pages. Shared content (FAQs) is shown on several sites, where a
 * page reference would resolve against whichever site renders it, so shared
 * content links by address instead: a path opens on the rendering site, a
 * full URL pins one site.
 */
export const isSiteScopedDocument = (document: DocumentLike): boolean =>
  (SITE_SCOPED_TYPES as readonly string[]).includes(document?._type ?? "");

export const SHARED_CONTENT_LINK_MESSAGE =
  "Shared content is shown on more than one site, so it cannot point at one site's page. Choose External: a path such as /about opens on whichever site shows this content, and a full https:// address always opens one site.";

/** The pages a document may reference: its own site's, or none for shared content. */
export const internalPageFilter = (
  document: DocumentLike
): { filter: string; params?: Record<string, string> } => {
  const site = document?.site;
  return isSiteScopedDocument(document) && typeof site === "string"
    ? { filter: "site == $site", params: { site } }
    : { filter: "false" };
};

/** `type` rule: internal links exist only in site-scoped documents. */
export const linkTypeRule = (
  value: unknown,
  document: DocumentLike
): string | true =>
  value === "internal" && !isSiteScopedDocument(document)
    ? SHARED_CONTENT_LINK_MESSAGE
    : true;

/**
 * `internal` rule: the referenced page must still belong to the document's
 * site. The picker only offers those, but a page can be moved to another site
 * after it was linked, and the site then projects the link as broken.
 */
export const linkedPageRule = async (
  value: { _ref?: string } | undefined,
  { document, getClient }: Pick<ValidationContext, "document" | "getClient">
): Promise<string | true> => {
  const site = document?.site;
  if (!(value?._ref && isSiteKey(site))) {
    return true;
  }
  const linkedSite = await getClient({ apiVersion: API_VERSION }).fetch<
    string | null
  >(
    `*[_id in [$id, "drafts." + $id]][0].site`,
    { id: value._ref },
    { perspective: "raw" }
  );
  if (!linkedSite || linkedSite === site) {
    return true;
  }
  const name = isSiteKey(linkedSite) ? getSite(linkedSite).name : linkedSite;
  return `This page belongs to ${name}. Links stay on their own site; to send visitors to another site, use an External link with its full address.`;
};
