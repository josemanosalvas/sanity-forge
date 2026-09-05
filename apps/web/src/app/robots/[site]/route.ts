import { getSite, isSiteKey, siteKeys } from "@repo/internationalization/sites";
import { robotsTxt } from "@repo/seo/robots";

/**
 * `/robots.txt` is rewritten here by the proxy with the site resolved from
 * the host. One response per site is prerendered, so nothing reads request
 * headers at render time.
 */
export const generateStaticParams = () => siteKeys.map((site) => ({ site }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/robots/[site]">
) => {
  const { site } = await params;
  if (!isSiteKey(site)) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(robotsTxt(getSite(site)), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
