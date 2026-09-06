import { getSite, siteSupportsLocale } from "@repo/internationalization/sites";
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  sanityFetchStaticParams,
} from "@repo/sanity/live";
import type { DynamicFetchOptions } from "@repo/sanity/live";
import { pageMetadataQuery, pagePathsQuery } from "@repo/sanity/queries";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { stegaClean } from "next-sanity";
import { cacheLife } from "next/cache";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { locale as localeParam, site as siteParam } from "next/root-params";
import { Suspense } from "react";

import { PageBlocks, renderPageBlocks } from "@/components/page-blocks";
import { PageBuilder } from "@/components/page-builder";
import { PageBuilderJsonLd } from "@/components/page-builder-json-ld";
import { RegisterTranslations } from "@/components/translations";
import { fetchPage, fetchSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getSiteContext, toQueryParams } from "@/lib/site-context";
import type { SiteQueryParams } from "@/types";

type Params = Awaited<PageProps<"/[site]/[locale]/[[...slug]]">["params"]>;

/** Prerendered without a document yet, so the site × locale shell always exists. */
const PLACEHOLDER_SLUG = "__placeholder__";

/**
 * Navigations into a slug the build did not list are allowed to block: the
 * published render stays outside Suspense so a missing page can answer with a
 * real HTTP 404, which leaves no App Shell to show first. Recorded here so
 * Instant Insights validation reflects the decision instead of flagging it.
 */
export const instant = false;

const toPath = (slug: string[] | undefined) =>
  slug?.length ? `/${slug.join("/")}` : "/";

/**
 * A read failure during a production build would otherwise ship a site with
 * one placeholder path and no prerendered pages; `next dev` keeps the warning
 * so an offline checkout still starts.
 */
const isProductionBuild = () =>
  process.env.NEXT_PHASE === "phase-production-build";

export const generateStaticParams = async (): Promise<
  Pick<Params, "slug">[]
> => {
  // The page list does not depend on the root params: start it first.
  const pagesPromise = sanityFetchStaticParams({ query: pagePathsQuery });
  const [site, locale] = await Promise.all([siteParam(), localeParam()]);
  try {
    const { data: pages } = await pagesPromise;
    const params = pages.flatMap((page) =>
      page.site === site && page.language === locale && page.slug
        ? [
            {
              slug:
                page.slug === "/" ? [] : page.slug.split("/").filter(Boolean),
            },
          ]
        : []
    );
    return params.length > 0 ? params : [{ slug: [PLACEHOLDER_SLUG] }];
  } catch (error) {
    if (isProductionBuild()) {
      throw error;
    }
    console.warn(
      `[web] Could not list pages for ${site}/${locale}:`,
      (error as Error).message
    );
    return [{ slug: [PLACEHOLDER_SLUG] }];
  }
};

export const generateMetadata = async ({
  params,
}: PageProps<"/[site]/[locale]/[[...slug]]">): Promise<Metadata> => {
  const [{ slug }, context, { perspective, variant }] = await Promise.all([
    params,
    getSiteContext(),
    getDynamicFetchOptions(),
  ]);
  const queryParams = toQueryParams(context);
  const [{ data: page }, settings] = await Promise.all([
    sanityFetchMetadata({
      params: { ...queryParams, path: toPath(slug) },
      perspective,
      query: pageMetadataQuery,
      variant,
    }),
    // The same cached scope the layout, footer and structured data read.
    fetchSettings({ ...queryParams, perspective, stega: false, variant }).then(
      stegaClean
    ),
  ]);
  if (!page) {
    const t = await getTranslations("notFound");
    return { robots: { follow: true, index: false }, title: t("eyebrow") };
  }
  return pageMetadata(context, page, settings);
};

/** Draft Mode only: published renders never suspend, so it never shows this. */
const PageFallback = () => (
  <section aria-busy className="block-section">
    <div className="container">
      <div className="bg-muted h-12 w-2/3 animate-pulse rounded" />
      <div className="bg-muted mt-6 h-5 w-1/2 animate-pulse rounded" />
    </div>
  </section>
);

const CachedPage = async ({
  site,
  locale,
  defaultLocale,
  path,
  perspective,
  stega,
  variant,
}: SiteQueryParams & { path: string } & DynamicFetchOptions) => {
  "use cache";
  cacheLife("sanity");
  const page = await fetchPage({
    defaultLocale,
    locale,
    path,
    perspective,
    site,
    stega,
    variant,
  });
  if (!page) {
    // `fetchPage` caches the miss; only this render re-runs on repeat hits.
    notFound();
  }

  const siteDefinition = getSite(site);
  const translations = (page.translations ?? []).flatMap((translation) =>
    translation.slug &&
    stegaClean(translation.site) === site &&
    siteSupportsLocale(siteDefinition, translation.language)
      ? [{ locale: translation.language, path: translation.slug }]
      : []
  );

  // Blocks render here, on the server, in both modes; stega marks a draft
  // render, which is the only one Presentation edits.
  const blocks = renderPageBlocks({
    blocks: page.pageBuilder ?? [],
    editable: stega,
    id: page._id,
    type: page._type,
  });

  let content;
  if (blocks.length === 0) {
    content = (
      <section className="block-section">
        <div className="container">
          <h1 className="block-title">{page.title}</h1>
          {page.description && (
            <p className="body-text text-muted-foreground mt-4 max-w-2xl">
              {page.description}
            </p>
          )}
        </div>
      </section>
    );
  } else if (stega) {
    content = <PageBuilder blocks={blocks} id={page._id} type={page._type} />;
  } else {
    content = <PageBlocks blocks={blocks} />;
  }

  return (
    <>
      <RegisterTranslations translations={translations} />
      <PageBuilderJsonLd pageBuilder={page.pageBuilder} />
      {content}
    </>
  );
};

type PageParams = Pick<PageProps<"/[site]/[locale]/[[...slug]]">, "params">;

const DynamicPage = async ({ params }: PageParams) => {
  const [{ slug }, context, { perspective, stega, variant }] =
    await Promise.all([params, getSiteContext(), getDynamicFetchOptions()]);
  return (
    <CachedPage
      {...toQueryParams(context)}
      path={toPath(slug)}
      perspective={perspective}
      stega={stega}
      variant={variant}
    />
  );
};

// Keep published renders outside Suspense so missing pages return HTTP 404.
// Draft renders stream while preview cookies resolve.
const Page = async ({ params }: PageProps<"/[site]/[locale]/[[...slug]]">) => {
  const { isEnabled: isDraftMode } = await draftMode();
  if (isDraftMode) {
    return (
      <Suspense fallback={<PageFallback />}>
        <DynamicPage params={params} />
      </Suspense>
    );
  }

  const [{ slug }, context] = await Promise.all([params, getSiteContext()]);
  return (
    <CachedPage
      {...toQueryParams(context)}
      path={toPath(slug)}
      perspective="published"
      stega={false}
    />
  );
};

export default Page;
