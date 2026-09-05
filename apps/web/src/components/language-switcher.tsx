"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { localeLabels } from "@repo/internationalization/locales";
import {
  Link,
  useSite,
  useSiteLocale,
} from "@repo/internationalization/navigation";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";

import { usePageTranslations } from "./translations";

/**
 * Switches between the locales this site serves. A locale links to the
 * current page's translation when one is published, otherwise to that
 * locale's home page.
 */
export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const site = useSite();
  const current = useSiteLocale();
  const translations = usePageTranslations();
  const t = useTranslations("common");

  if (site.locales.length < 2) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={t("switchLanguage")}
            className={className}
            size="icon"
            variant="ghost"
          />
        }
      >
        <Languages />
        <span className="sr-only">{t("switchLanguage")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {site.locales.map((locale) => {
          const translation = translations.find(
            (candidate) => candidate.locale === locale
          );
          return (
            <DropdownMenuItem
              aria-current={locale === current ? "true" : undefined}
              key={locale}
              render={
                <Link
                  href={translation?.path ?? "/"}
                  hrefLang={locale}
                  locale={locale}
                />
              }
            >
              {localeLabels[locale]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
