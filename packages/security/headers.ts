import { defaults, withVercelToolbar } from "@nosecone/next";
import type { Options } from "@nosecone/next";
import { nosecone } from "nosecone";
import type { CspDirectives } from "nosecone";

const isDevelopment = process.env.NODE_ENV === "development";

type CspSource =
  | "scriptSrc"
  | "connectSrc"
  | "imgSrc"
  | "fontSrc"
  | "styleSrc"
  | "frameSrc"
  | "mediaSrc"
  | "workerSrc";

export interface SecurityHeadersOptions {
  /** Origins allowed to embed the site in an iframe, e.g. the Sanity Studio for Presentation. */
  readonly frameAncestors?: readonly string[];
  /** Extra Content Security Policy sources merged into the defaults. */
  readonly csp?: Partial<Record<CspSource, readonly string[]>>;
  /** Disable CSP entirely (the other headers are still sent). */
  readonly contentSecurityPolicy?: boolean;
  /** Allow the Vercel Toolbar's scripts and sockets. */
  readonly vercelToolbar?: boolean;
}

const base = defaults.contentSecurityPolicy.directives;

/** Sources the Sanity client, Live Content API and Visual Editing need. */
export const sanitySources = {
  connectSrc: [
    "https://*.api.sanity.io",
    "https://*.apicdn.sanity.io",
    "wss://*.api.sanity.io",
  ],
  imgSrc: ["https://cdn.sanity.io"],
} as const;

/**
 * Production-safe headers for a Next.js + Sanity site, built on nosecone's
 * defaults with the changes a content site needs: the Studio may frame the
 * site for Presentation, images and media load from the CDN, and inline
 * scripts are allowed because static shells cannot carry per-request nonces.
 */
const createDirectives = ({
  frameAncestors,
  csp,
}: Required<
  Pick<SecurityHeadersOptions, "frameAncestors" | "csp">
>): CspDirectives =>
  ({
    ...base,
    // Next.js and its analytics/theme scripts inject inline bootstrap
    // code; nonces would force every page to render dynamically.
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      ...(csp.scriptSrc ?? []),
    ],
    styleSrc: ["'self'", "'unsafe-inline'", ...(csp.styleSrc ?? [])],
    connectSrc: [
      ...base.connectSrc,
      ...sanitySources.connectSrc,
      ...(csp.connectSrc ?? []),
    ],
    imgSrc: [...base.imgSrc, ...sanitySources.imgSrc, ...(csp.imgSrc ?? [])],
    fontSrc: [...base.fontSrc, ...(csp.fontSrc ?? [])],
    mediaSrc: [...base.mediaSrc, "blob:", ...(csp.mediaSrc ?? [])],
    workerSrc: [...base.workerSrc, "blob:", ...(csp.workerSrc ?? [])],
    frameSrc: csp.frameSrc?.length ? [...csp.frameSrc] : base.frameSrc,
    frameAncestors: frameAncestors.length
      ? ["'self'", ...frameAncestors]
      : base.frameAncestors,
    upgradeInsecureRequests: !isDevelopment,
  }) as CspDirectives;

export const createSecurityOptions = ({
  frameAncestors = [],
  csp = {},
  contentSecurityPolicy = true,
  vercelToolbar = false,
}: SecurityHeadersOptions = {}): Options => {
  const options: Options = {
    ...defaults,
    contentSecurityPolicy: contentSecurityPolicy
      ? { directives: createDirectives({ frameAncestors, csp }) }
      : false,
    // The strict isolation defaults break the Studio iframe and CDN assets.
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // frame-ancestors supersedes X-Frame-Options; SAMEORIGIN would block a cross-origin Studio.
    xFrameOptions: frameAncestors.length ? false : { action: "sameorigin" },
    referrerPolicy: { policy: ["strict-origin-when-cross-origin"] },
    strictTransportSecurity: isDevelopment
      ? false
      : { maxAge: 63_072_000, includeSubDomains: true, preload: false },
  };

  return vercelToolbar ? withVercelToolbar(options) : options;
};

/** Builds the full header set for a response. */
export const createSecurityHeaders = (
  options?: SecurityHeadersOptions
): Headers => {
  const headers = nosecone(createSecurityOptions(options));
  headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  return headers;
};

/** Copies the security headers onto a response you already built (next/rewrite/redirect). */
export const applySecurityHeaders = <T extends Response>(
  response: T,
  options?: SecurityHeadersOptions
): T => {
  for (const [key, value] of createSecurityHeaders(options)) {
    response.headers.set(key, value);
  }
  return response;
};
