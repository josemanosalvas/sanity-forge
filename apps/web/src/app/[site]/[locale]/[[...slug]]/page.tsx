import { siteSupportsLocale } from "@repo/internationalization/sites";
import {
  getDynamicFetchOptions,
  PUBLISHED_FETCH_OPTIONS,
  sanityFetchStatic,
} from "@repo/sanity/live";
import { pagePathsQuery } from "@repo/sanity/queries";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { locale as localeParam, site as siteParam } from "next/root-params";
import { Suspense } from "react";

import { PageBuilder } from "@/components/page-builder";
import { PageBuilderJsonLd } from "@/components/page-builder-json-ld";
import { RegisterTranslations } from "@/components/translations";
import { getPage, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getSiteContext, toQueryParams } from "@/lib/site-context";
import type { FetchOptions, PageData, SiteContext } from "@/types";

interface Params {
  slug?: string[];
}

/** Prerendered without a document yet, so the site × locale shell always exists. */
const PLACEHOLDER_SLUG = "__placeholder__";

const toPath = (slug: string[] | undefined) =>
  slug?.length ? `/${slug.join("/")}` : "/";

export async function generateStaticParams(): Promise<Params[]> {
  const [site, locale] = await Promise.all([siteParam(), localeParam()]);
  try {
    const pages = await sanityFetchStatic({ query: pagePathsQuery });
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
}

export async function generateMetadata({
  params,
}: PageProps<"/[site]/[locale]/[[...slug]]">): Promise<Metadata> {
  const [{ slug }, context, { perspective }] = await Promise.all([
    params,
    getSiteContext(),
    getDynamicFetchOptions(),
  ]);
  const query = { ...toQueryParams(context), perspective, stega: false };
  const [page, settings] = await Promise.all([
    getPage({ ...query, path: toPath(slug) }),
    getSettings(query),
  ]);
  if (!page) {
    return {};
  }
  return pageMetadata(context, page, settings);
}

export default async function Page({
  params,
}: PageProps<"/[site]/[locale]/[[...slug]]">) {
  const { isEnabled } = await draftMode();

  if (isEnabled) {
    return (
      <Suspense fallback={null}>
        <DraftPage params={params} />
      </Suspense>
    );
  }

  // Published render with a real 404, not a soft one streamed inside Suspense.
  const [{ slug }, context] = await Promise.all([params, getSiteContext()]);
  const page = await getPage({
    ...toQueryParams(context),
    ...PUBLISHED_FETCH_OPTIONS,
    path: toPath(slug),
  });
  if (!page) {
    notFound();
  }
  return <PageContent context={context} page={page} />;
}

async function DraftPage({ params }: { params: Promise<Params> }) {
  const [{ slug }, context, options] = await Promise.all([
    params,
    getSiteContext(),
    getDynamicFetchOptions(),
  ]);
  const page = await getPage({
    ...toQueryParams(context),
    ...options,
    path: toPath(slug),
  });
  if (!page) {
    notFound();
  }
  return <PageContent context={context} options={options} page={page} />;
}

function PageContent({
  context,
  page,
}: {
  context: SiteContext;
  page: PageData;
  options?: FetchOptions;
}) {
  const translations = (page.translations ?? []).flatMap((translation) =>
    translation.slug && siteSupportsLocale(context.site, translation.language)
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
}
