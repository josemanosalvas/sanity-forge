"use client";

import { SanityButtons } from "@repo/blocks/internal/sanity-buttons";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/design-system/components/ui/navigation-menu";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { MenuLink } from "@/components/menu-link";
import { MobileMenu } from "@/components/mobile-menu";
import type { NavigationData } from "@/types";

export const Navbar = ({
  navigation,
  settings,
  siteName,
}: NavigationData & { siteName: string }) => {
  const t = useTranslations("common");
  const pathname = usePathname();
  const { columns, buttons } = navigation ?? {};
  const currentPage = (href?: string | null) =>
    href && href === pathname ? ("page" as const) : undefined;

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
            {columns?.map((column) => {
              // `type` is stega-branded, so narrow on the shape instead.
              if ("links" in column) {
                return (
                  <NavigationMenuItem key={column._key}>
                    <NavigationMenuTrigger>
                      {column.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-max max-w-sm gap-1 p-2">
                        {column.links?.map((link) => (
                          <li key={link._key}>
                            <MenuLink
                              description={link.description}
                              href={link.href}
                              icon={link.icon}
                              name={link.name}
                              openInNewTab={link.openInNewTab}
                            />
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              }
              if ("href" in column && column.href) {
                return (
                  <NavigationMenuItem key={column._key}>
                    <NavigationMenuLink
                      aria-current={currentPage(column.href)}
                      className={navigationMenuTriggerStyle()}
                      render={
                        <Link
                          href={column.href}
                          rel={
                            column.openInNewTab
                              ? "noopener noreferrer"
                              : undefined
                          }
                          target={column.openInNewTab ? "_blank" : undefined}
                        />
                      }
                    >
                      {column.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              }
              return null;
            })}
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
          <ModeToggle />
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 lg:hidden">
          <LanguageSwitcher />
          <ModeToggle />
          <MobileMenu navigation={navigation} siteName={siteName} />
        </div>
      </div>
    </header>
  );
};
