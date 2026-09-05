import type { Locale } from "./locales";

/** Deployment configuration. The key joins routes to Sanity documents; keep it stable. */
export interface SiteDefinition {
  /** Stable identifier stored on Sanity documents and used in internal routes. */
  readonly key: string;
  /** Human-readable name, shown in the Studio and used as a metadata fallback. */
  readonly name: string;
  /** Locales this site serves. The first entry is the default (unprefixed) locale. */
  readonly locales: readonly [Locale, ...Locale[]];
  /** Hostnames per environment. Production is also the canonical origin. */
  readonly domains: {
    readonly production: string;
    readonly development: string;
  };
}

export const sites = {
  "brand-a": {
    domains: {
      development: "brand-a.localhost:3000",
      production: "brand-a.example",
    },
    key: "brand-a",
    locales: ["en", "de", "fr"],
    name: "Brand A",
  },
  "brand-b": {
    domains: {
      development: "brand-b.localhost:3000",
      production: "brand-b.example",
    },
    key: "brand-b",
    locales: ["en", "de"],
    name: "Brand B",
  },
} as const satisfies Record<string, SiteDefinition>;

export type SiteKey = keyof typeof sites;

export type Site = (typeof sites)[SiteKey];

export const siteKeys = Object.keys(sites) as SiteKey[];

export const siteList: readonly Site[] = Object.values(sites);

/** Used when a request's host matches no known site (e.g. preview deployments). */
export const defaultSiteKey: SiteKey = "brand-a";

export const isSiteKey = (value: unknown): value is SiteKey =>
  typeof value === "string" && Object.hasOwn(sites, value);

export const getSite = (key: SiteKey): Site => sites[key];

export const getSiteOrDefault = (key: unknown): Site =>
  isSiteKey(key) ? sites[key] : sites[defaultSiteKey];

export const getDefaultLocale = (site: Site | SiteKey): Locale =>
  (typeof site === "string" ? sites[site] : site).locales[0];

export const siteSupportsLocale = (
  site: Site | SiteKey,
  locale: unknown
): locale is Locale => {
  const definition = typeof site === "string" ? sites[site] : site;
  return (
    typeof locale === "string" &&
    (definition.locales as readonly string[]).includes(locale)
  );
};

export type SiteEnvironment = keyof SiteDefinition["domains"];

const normalizeHost = (host: string) => host.trim().toLowerCase();

/** A hostname and its `www.` counterpart (or apex, when the domain already has `www.`). */
export const hostVariants = (domain: string) => {
  const host = normalizeHost(domain);
  return host.startsWith("www.")
    ? [host, host.slice(4)]
    : [host, `www.${host}`];
};

export const resolveSiteFromHost = (
  host: string | null | undefined
): Site | undefined => {
  if (!host) {
    return undefined;
  }
  const needle = normalizeHost(host);
  return siteList.find((site) =>
    Object.values(site.domains).some((domain) =>
      hostVariants(domain).includes(needle)
    )
  );
};

/** Absolute origin for a site in the given environment, e.g. `https://brand-a.example`. */
export const getSiteOrigin = (
  site: Site | SiteKey,
  environment: SiteEnvironment = "production"
): string => {
  const definition = typeof site === "string" ? sites[site] : site;
  const domain = definition.domains[environment];
  const protocol = environment === "development" ? "http" : "https";
  return `${protocol}://${domain}`;
};

/** Every origin Presentation and CORS should trust, across sites and environments. */
const siteEnvironments: readonly SiteEnvironment[] = [
  "production",
  "development",
];

export const getAllSiteOrigins = (): string[] =>
  siteList.flatMap((site) =>
    siteEnvironments.map((environment) => getSiteOrigin(site, environment))
  );
