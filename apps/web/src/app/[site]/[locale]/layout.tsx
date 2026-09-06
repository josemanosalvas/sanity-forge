import "@/app/globals.css";
import { AnalyticsProvider } from "@repo/analytics/provider";
import { SiteProvider } from "@repo/internationalization/navigation";
import { siteList } from "@repo/internationalization/sites";
import { getDynamicFetchOptions, SanityLive } from "@repo/sanity/live";
import type { DynamicFetchOptions } from "@repo/sanity/live";
import { UIProvider } from "@repo/ui/provider";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { stegaClean } from "next-sanity";
import { VisualEditing } from "next-sanity/visual-editing";
import { cacheLife } from "next/cache";
import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";

import { BlockLabels } from "@/components/block-labels";
import { ChromeBoundary } from "@/components/chrome-boundary";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PreviewBar } from "@/components/preview-bar";
import { SiteJsonLd } from "@/components/site-json-ld";
import { TranslationsProvider } from "@/components/translations";
import { fetchFooter, fetchNavigation, fetchSettings } from "@/lib/content";
import { siteMetadata } from "@/lib/seo";
import { getSiteContext, toQueryParams } from "@/lib/site-context";
import type { SiteContext } from "@/types";

// Registered on <html> under app-specific names; the design system's
// `--font-sans` / `--font-mono` tokens fall back to system stacks without them.
const fontSans = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-app-sans",
});
const fontMono = Geist_Mono({
  display: "swap",
  // Used for eyebrows and code only; not worth a preload on every route.
  preload: false,
  subsets: ["latin"],
  variable: "--font-app-mono",
});

/** Every site × locale pair is prerendered; a slug the page did not list renders on its first request. */
export const generateStaticParams = () =>
  siteList.flatMap((site) =>
    site.locales.map((locale) => ({ locale, site: site.key }))
  );

/** Reads the settings through the same cached scope the footer and structured data use. */
export const generateMetadata = async () => {
  const [context, { perspective, variant }] = await Promise.all([
    getSiteContext(),
    getDynamicFetchOptions(),
  ]);
  const settings = stegaClean(
    await fetchSettings({
      ...toQueryParams(context),
      perspective,
      stega: false,
      variant,
    })
  );
  return siteMetadata(context, settings);
};

type CachedProps = { context: SiteContext } & DynamicFetchOptions;

const CachedHeader = async ({ context, ...options }: CachedProps) => {
  "use cache";
  cacheLife("sanity");
  const data = await fetchNavigation({ ...toQueryParams(context), ...options });
  return <Header context={context} data={data} />;
};

const DynamicHeader = async ({ context }: { context: SiteContext }) => {
  const options = await getDynamicFetchOptions();
  return <CachedHeader context={context} {...options} />;
};

const HeaderFallback = () => (
  <header aria-busy className="border-border min-h-16 border-b" />
);

const CachedFooter = async ({ context, ...options }: CachedProps) => {
  "use cache";
  cacheLife("sanity");
  const params = { ...toQueryParams(context), ...options };
  const [footer, settings] = await Promise.all([
    fetchFooter(params),
    fetchSettings(params),
  ]);
  return <Footer context={context} footer={footer} settings={settings} />;
};

const DynamicFooter = async ({ context }: { context: SiteContext }) => {
  const options = await getDynamicFetchOptions();
  return <CachedFooter context={context} {...options} />;
};

const FooterFallback = () => (
  <footer aria-busy className="border-border min-h-64 border-t" />
);

const RootLayout = async ({ children }: LayoutProps<"/[site]/[locale]">) => {
  const [context, { isEnabled: isDraftMode }, t] = await Promise.all([
    getSiteContext(),
    draftMode(),
    getTranslations("common"),
  ]);
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");

  return (
    <html
      className={`${fontSans.variable} ${fontMono.variable}`}
      data-site={context.site.key}
      lang={context.locale}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        {/* A same-page fragment: a plain anchor, not a router link. */}
        <a
          className="focus-ring bg-background text-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2"
          href="#main"
        >
          {t("skipToContent")}
        </a>
        <UIProvider>
          <NextIntlClientProvider>
            <BlockLabels>
              <SiteProvider site={context.site}>
                <TranslationsProvider>
                  <AnalyticsProvider>
                    {/*
                     * The chrome is rendered here, beside the page, where the
                     * segment's error.tsx cannot reach it; each read gets its
                     * own boundary so a failed query degrades one region.
                     */}
                    <ChromeBoundary slot="header">
                      {isDraftMode ? (
                        <Suspense fallback={<HeaderFallback />}>
                          <DynamicHeader context={context} />
                        </Suspense>
                      ) : (
                        <CachedHeader
                          context={context}
                          perspective="published"
                          stega={false}
                        />
                      )}
                    </ChromeBoundary>
                    <main
                      className="min-h-dvh outline-none"
                      id="main"
                      tabIndex={-1}
                    >
                      {children}
                    </main>
                    <ChromeBoundary slot="footer">
                      {isDraftMode ? (
                        <Suspense fallback={<FooterFallback />}>
                          <DynamicFooter context={context} />
                        </Suspense>
                      ) : (
                        <CachedFooter
                          context={context}
                          perspective="published"
                          stega={false}
                        />
                      )}
                    </ChromeBoundary>
                    {/* Structured data is for crawlers, which never hold a draft session. */}
                    {!isDraftMode && (
                      <ChromeBoundary slot="data">
                        <SiteJsonLd
                          context={context}
                          perspective="published"
                          stega={false}
                        />
                      </ChromeBoundary>
                    )}
                    {/* The default Live action handles refresh and invalidation for each mode. */}
                    <SanityLive includeDrafts={isDraftMode} />
                    {isDraftMode && (
                      <>
                        <PreviewBar />
                        <VisualEditing />
                      </>
                    )}
                  </AnalyticsProvider>
                </TranslationsProvider>
              </SiteProvider>
            </BlockLabels>
          </NextIntlClientProvider>
        </UIProvider>
      </body>
    </html>
  );
};

export default RootLayout;
