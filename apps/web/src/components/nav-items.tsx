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

import { LinkStatus } from "@/components/link-status";
import { MenuLink } from "@/components/menu-link";
import type { NavigationData } from "@/types";

export type NavColumns = NonNullable<NavigationData["navigation"]>["columns"];

/** A null pathname omits aria-current for the Suspense fallback. */
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
            <LinkStatus />
          </NavigationMenuLink>
        </NavigationMenuItem>
      );
    }
    return null;
  });

/**
 * usePathname needs Suspense for routes not listed by generateStaticParams.
 * Wait for mount before comparing public hrefs: server HTML uses rewritten paths.
 */
export const CurrentNavItems = ({ columns }: { columns?: NavColumns }) => {
  const pathname = usePathname();
  const mounted = useMounted();
  return <NavItems columns={columns} pathname={mounted ? pathname : null} />;
};
