import { getSite, siteSupportsLocale } from "@repo/internationalization/sites";
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  sanityFetchStaticParams,
} from "@repo/sanity/live";
import type { DynamicFetchOptions } from "@repo/sanity/live";
import { pagePathsQuery, pageQuery, settingsQuery } from "@repo/sanity/queries";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { locale as localeParam, site as siteParam } from "next/root-params";
import { Suspense } from "react";

import { PageBuilder } from "@/components/page-builder";
import { PageBuilderJsonLd } from "@/components/page-builder-json-ld";
import { RegisterTranslations } from "@/components/translations";
import { fetchPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getSiteContext, toQueryParams } from "@/lib/site-context";
import type { SiteQueryParams } from "@/types";

type Params = Awaited<PageProps<"/[site]/[locale]/[[...slug]]">["params"]>;

/** Prerendered without a document yet, so the site × locale shell always exists. */
const PLACEHOLDER_SLUG = "__placeholder__";

const toPath = (slug: string[] | undefined) =>
  slug?.length ? `/${slug.join("/")}` : "/";

export const generateStaticParams = async (): Promise<
  Pick<Params, "slug">[]
> => {
  const [site, locale] = await Promise.all([siteParam(), localeParam()]);
  try {
    const { data: pages } = await sanityFetchStaticParams({
      query: pagePathsQuery,
    });
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
  const [{ slug }, context, { perspective }] = await Promise.all([
    params,
    getSiteContext(),
    getDynamicFetchOptions(),
  ]);
  const queryParams = toQueryParams(context);
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetchMetadata({
      params: { ...queryParams, path: toPath(slug) },
      perspective,
      query: pageQuery,
    }),
    sanityFetchMetadata({
      params: queryParams,
      perspective,
      query: settingsQuery,
    }),
  ]);
  if (!page) {
    return {};
  }
  return pageMetadata(context, page, settings);
};

/** Draft Mode only: the published shell never suspends, so it never shows this. */
const PageFallback = () => (
  <section aria-busy className="block-section">
    <div className="container">
      <div className="bg-muted h-12 w-2/3 animate-pulse rounded" />
      <div className="bg-muted mt-6 h-5 w-1/2 animate-pulse rounded" />
    </div>
  </section>
);

// Layer 3: cached, plain serializable props only.
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
    notFound();
  }

  const siteDefinition = getSite(site);
  const translations = (page.translations ?? []).flatMap((translation) =>
    translation.slug && siteSupportsLocale(siteDefinition, translation.language)
      ? [{ locale: translation.language, path: translation.slug }]
      : []
  );

  return (
    <>
      <RegisterTranslations translations={translations} />
      <PageBuilderJsonLd pageBuilder={page.pageBuilder} />
      {page.pageBuilder?.length ? (
        <PageBuilder
          id={page._id}
          pageBuilder={page.pageBuilder}
          type={page._type}
        />
      ) : (
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
      )}
    </>
  );
};

// Layer 2: resolves params and the draft session outside the cache boundary.
const DynamicPage = async ({
  params,
}: Pick<PageProps<"/[site]/[locale]/[[...slug]]">, "params">) => {
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

// Layer 1: branches on Draft Mode; published renders skip Suspense entirely.
const Page = async ({ params }: PageProps<"/[site]/[locale]/[[...slug]]">) => {
  const { isEnabled: isDraftMode } = await draftMode();
  if (isDraftMode) {
    return (
      <Suspense fallback={<PageFallback />}>
        <DynamicPage
          // Awaited inside <DynamicPage> so the Suspense boundary can stream.
          params={params}
        />
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
