import { SanityButtons } from "@repo/blocks/components/sanity-buttons";
import { ModeToggle } from "@repo/ui/components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@repo/ui/components/navigation-menu";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { CurrentNavItems, NavItems } from "@/components/nav-items";
import type { NavigationData } from "@/types";

/**
 * A Server Component: next-intl's `useTranslations` resolves on the server,
 * and every interactive part below declares its own client boundary, so the
 * header shell and the logo stay out of the browser bundle.
 */
export const Navbar = ({
  navigation,
  settings,
  siteName,
}: NavigationData & { siteName: string }) => {
  const t = useTranslations("common");
  const { columns, buttons } = navigation ?? {};
  const themeLabels = {
    dark: t("theme.dark"),
    light: t("theme.light"),
    system: t("theme.system"),
    toggle: t("theme.label"),
  };

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex flex-1 items-center">
          <Logo
            alt={siteName}
            className="h-5 w-auto object-left"
            image={settings?.logos?.logo}
            imageDark={settings?.logos?.logoDark}
          />
        </div>

        <NavigationMenu
          aria-label={t("mainNavigation")}
          className="hidden lg:flex"
        >
          <NavigationMenuList className="gap-1">
            {/* Only the current-page marker needs the URL; see nav-items.tsx. */}
            <Suspense fallback={<NavItems columns={columns} />}>
              <CurrentNavItems columns={columns} />
            </Suspense>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden flex-1 items-center justify-end gap-2 lg:flex">
          <SanityButtons
            buttonClassName="rounded-full"
            buttons={buttons ?? []}
            className="flex items-center gap-2"
            size="sm"
          />
          <LanguageSwitcher />
          <ModeToggle labels={themeLabels} />
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 lg:hidden">
          <LanguageSwitcher />
          <ModeToggle labels={themeLabels} />
          <MobileMenu navigation={navigation} siteName={siteName} />
        </div>
      </div>
    </header>
  );
};
