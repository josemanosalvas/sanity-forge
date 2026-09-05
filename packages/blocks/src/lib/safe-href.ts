const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export const isSafeHref = (href: string): boolean => {
  if (href.startsWith("/") || href.startsWith("#")) {
    return true;
  }
  try {
    return ALLOWED_PROTOCOLS.has(new URL(href).protocol);
  } catch {
    return false;
  }
};

export const sanitizeHref = (
  href?: string | null | undefined
): string | undefined => {
  const trimmed = href?.trim();
  if (!trimmed) {
    return undefined;
  }
  return isSafeHref(trimmed) ? trimmed : undefined;
};

/**
 * Return a same-origin path or `/`. Use the URL parser to catch host changes
 * from backslashes and control characters; collapse leading pathname slashes
 * so parsing the result again cannot turn it into an external URL.
 */
export const internalPathOnly = (
  path: string | null | undefined,
  base: string | URL
): string => {
  if (!path) {
    return "/";
  }
  try {
    const baseUrl = new URL(base);
    const target = new URL(path, baseUrl);
    if (target.origin !== baseUrl.origin) {
      return "/";
    }
    const pathname = target.pathname.replace(/^\/{2,}/u, "/");
    return `${pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
};
