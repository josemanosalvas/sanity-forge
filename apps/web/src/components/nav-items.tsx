"use client";

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/navigation-menu";
import { useMounted } from "@repo/ui/hooks/use-mounted";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MenuLink } from "@/components/menu-link";
import type { NavigationData } from "@/types";

export type NavColumns = NonNullable<NavigationData["navigation"]>["columns"];

/**
 * The desktop menu items. `pathname` is the page to mark with
 * `aria-current`; `null` marks none. Everything else is plain markup, so this
 * doubles as the Suspense fallback for `CurrentNavItems`.
 */
export const NavItems = ({
  columns,
  pathname = null,
}: {
  columns?: NavColumns;
  pathname?: string | null;
}) =>
  columns?.map((column) => {
    // `type` is stega-branded, so narrow on the shape instead.
    if ("links" in column) {
      return (
        <NavigationMenuItem key={column._key}>
          <NavigationMenuTrigger>{column.title}</NavigationMenuTrigger>
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
            aria-current={column.href === pathname ? "page" : undefined}
            className={navigationMenuTriggerStyle()}
            render={
              <Link
                href={column.href}
                rel={column.openInNewTab ? "noopener noreferrer" : undefined}
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
  });

/**
 * Marks the current page. Reading the pathname is the one thing in the header
 * that needs the URL: on a slug `generateStaticParams` did not list, Cache
 * Components cannot know it while prerendering the fallback shell, so this
 * suspends and the caller renders plain `<NavItems>` as the fallback (Next
 * docs: "URL data in a Client Component outside of Suspense").
 *
 * Prerendered HTML is generated for the internal `/[site]/[locale]/…` path
 * behind the proxy rewrite, while CMS hrefs are public paths, so the
 * comparison waits for mount; earlier it would mismatch on hydration (Next
 * docs, usePathname: "Avoid hydration mismatch with rewrites").
 */
export const CurrentNavItems = ({ columns }: { columns?: NavColumns }) => {
  const pathname = usePathname();
  const mounted = useMounted();
  return <NavItems columns={columns} pathname={mounted ? pathname : null} />;
};
