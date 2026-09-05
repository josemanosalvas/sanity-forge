"use client";

import type { Locale } from "@repo/internationalization/locales";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface PageTranslation {
  readonly locale: Locale;
  readonly path: string;
}

interface TranslationsContextValue {
  readonly translations: readonly PageTranslation[];
  readonly register: (translations: readonly PageTranslation[]) => void;
}

const TranslationsContext = createContext<TranslationsContextValue | null>(
  null
);

/**
 * Lets a page tell the layout which localized alternatives it has, so the
 * header's language switcher can link to the translated slug instead of the
 * locale's home page. Lives in the layout; pages register on mount.
 */
export const TranslationsProvider = ({ children }: { children: ReactNode }) => {
  const [translations, setTranslations] = useState<readonly PageTranslation[]>(
    []
  );
  const value = useMemo(
    () => ({ translations, register: setTranslations }),
    [translations]
  );
  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
};

export const usePageTranslations = (): readonly PageTranslation[] =>
  useContext(TranslationsContext)?.translations ?? [];

/** Rendered by a page to publish its translations; renders nothing. */
export const RegisterTranslations = ({
  translations,
}: {
  translations: readonly PageTranslation[];
}) => {
  const register = useContext(TranslationsContext)?.register;

  // Server-rendered props keep their identity across client re-renders, so
  // this runs once per page, and clears when the page unmounts.
  useEffect(() => {
    register?.(translations);
    return () => register?.([]);
  }, [register, translations]);

  return null;
};
