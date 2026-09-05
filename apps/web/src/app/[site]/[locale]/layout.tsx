import "@/app/globals.css";
import { AnalyticsProvider } from "@repo/analytics/provider";
import { SiteProvider } from "@repo/internationalization/navigation";
import { siteList } from "@repo/internationalization/sites";
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  SanityLive,
} from "@repo/sanity/live";
import type { DynamicFetchOptions } from "@repo/sanity/live";
import { settingsQuery } from "@repo/sanity/queries";
import { UIProvider } from "@repo/ui/provider";
import { NextIntlClientProvider } from "next-intl";
import { VisualEditing } from "next-sanity/visual-editing";
import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";

import { BlockLabels } from "@/components/block-labels";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PreviewBar } from "@/components/preview-bar";
import { SiteJsonLd } from "@/components/site-json-ld";
import { TranslationsProvider } from "@/components/translations";
import { fetchFooter, fetchNavigation, fetchSettings } from "@/lib/content";
import { siteMetadata } from "@/lib/seo";
import {
  getSiteContext,
  toQueryParams,
  toSettingsParams,
} from "@/lib/site-context";
import type { SiteContext } from "@/types";

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

/** Every site × locale pair is prerendered; a slug the page did not list renders on its first request. */
export const generateStaticParams = () =>
  siteList.flatMap((site) =>
    site.locales.map((locale) => ({ locale, site: site.key }))
  );

export const generateMetadata = async () => {
  const [context, { perspective }] = await Promise.all([
    getSiteContext(),
    getDynamicFetchOptions(),
  ]);
  const { data: settings } = await sanityFetchMetadata({
    params: toSettingsParams(context),
    perspective,
    query: settingsQuery,
  });
  return siteMetadata(context, settings);
};

type CachedProps = { context: SiteContext } & DynamicFetchOptions;

const CachedHeader = async ({ context, ...options }: CachedProps) => {
  "use cache";
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
  const [context, { isEnabled: isDraftMode }] = await Promise.all([
    getSiteContext(),
    draftMode(),
  ]);
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");

  return (
    <html
      data-site={context.site.key}
      lang={context.locale}
      suppressHydrationWarning
    >
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <UIProvider>
          <NextIntlClientProvider>
            <BlockLabels>
              <SiteProvider site={context.site}>
                <TranslationsProvider>
                  <AnalyticsProvider>
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
                    <main className="min-h-dvh" id="main">
                      {children}
                    </main>
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
                    {/* Structured data is for crawlers, which never hold a draft session. */}
                    <SiteJsonLd
                      context={context}
                      perspective="published"
                      stega={false}
                    />
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
