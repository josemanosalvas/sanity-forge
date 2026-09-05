import "@/app/globals.css";
import { AnalyticsProvider } from "@repo/analytics/provider";
import { DesignSystemProvider } from "@repo/design-system";
import { SiteProvider } from "@repo/internationalization/navigation";
import { siteList } from "@repo/internationalization/sites";
import {
  getDynamicFetchOptions,
  PUBLISHED_FETCH_OPTIONS,
  SanityLive,
} from "@repo/sanity/live";
import { NextIntlClientProvider } from "next-intl";
import { VisualEditing } from "next-sanity/visual-editing";
import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";

import { revalidateSyncTags } from "@/app/actions/revalidate";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PreviewBar } from "@/components/preview-bar";
import { SiteJsonLd } from "@/components/site-json-ld";
import { TranslationsProvider } from "@/components/translations";
import { getFooter, getNavigationData, getSettings } from "@/lib/content";
import { siteMetadata } from "@/lib/seo";
import { getSiteContext, toQueryParams } from "@/lib/site-context";
import type { FetchOptions, SiteContext } from "@/types";

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

/** Every site × locale pair has a static shell; unknown slugs upgrade in the background. */
export const generateStaticParams = () =>
  siteList.flatMap((site) =>
    site.locales.map((locale) => ({ site: site.key, locale }))
  );

export const generateMetadata = async () => {
  const context = await getSiteContext();
  const settings = await getSettings({
    ...toQueryParams(context),
    ...PUBLISHED_FETCH_OPTIONS,
  });
  return siteMetadata(context, settings);
};

export default async function RootLayout({
  children,
}: LayoutProps<"/[site]/[locale]">) {
  const context = await getSiteContext();
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
        <DesignSystemProvider>
          <NextIntlClientProvider>
            <SiteProvider site={context.site}>
              <TranslationsProvider>
                <AnalyticsProvider>
                  {/* Session-gated, not environment-gated: the published shell
                      stays static while a draft session swaps in live data. */}
                  <Suspense fallback={<PublishedHeader context={context} />}>
                    <DynamicHeader context={context} />
                  </Suspense>
                  <main className="min-h-dvh" id="main">
                    {children}
                  </main>
                  <Suspense fallback={<PublishedFooter context={context} />}>
                    <DynamicFooter context={context} />
                  </Suspense>
                  {/* Reads draftMode(), so it stays behind Suspense. */}
                  <Suspense fallback={null}>
                    <LivePreviewLayer />
                  </Suspense>
                  <Suspense fallback={null}>
                    <SiteJsonLd context={context} />
                  </Suspense>
                </AnalyticsProvider>
              </TranslationsProvider>
            </SiteProvider>
          </NextIntlClientProvider>
        </DesignSystemProvider>
      </body>
    </html>
  );
}

/** Live updates plus the Presentation overlay, wherever a validated draft session exists. */
async function LivePreviewLayer() {
  const { isEnabled } = await draftMode();
  return (
    <>
      <SanityLive action={revalidateSyncTags} includeDrafts={isEnabled} />
      {isEnabled && (
        <>
          <PreviewBar />
          <VisualEditing />
        </>
      )}
    </>
  );
}

async function DynamicHeader({ context }: { context: SiteContext }) {
  const options = await getDynamicFetchOptions();
  return <CachedHeader context={context} options={options} />;
}

function PublishedHeader({ context }: { context: SiteContext }) {
  return <CachedHeader context={context} options={PUBLISHED_FETCH_OPTIONS} />;
}

async function CachedHeader({
  context,
  options,
}: {
  context: SiteContext;
  options: FetchOptions;
}) {
  const data = await getNavigationData({
    ...toQueryParams(context),
    ...options,
  });
  return <Header context={context} data={data} />;
}

async function DynamicFooter({ context }: { context: SiteContext }) {
  const options = await getDynamicFetchOptions();
  return <CachedFooter context={context} options={options} />;
}

function PublishedFooter({ context }: { context: SiteContext }) {
  return <CachedFooter context={context} options={PUBLISHED_FETCH_OPTIONS} />;
}

async function CachedFooter({
  context,
  options,
}: {
  context: SiteContext;
  options: FetchOptions;
}) {
  const params = { ...toQueryParams(context), ...options };
  const [footer, settings] = await Promise.all([
    getFooter(params),
    getSettings(params),
  ]);
  return <Footer context={context} footer={footer} settings={settings} />;
}
