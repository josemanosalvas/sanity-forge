"use client";

import { SanityButtons } from "@repo/blocks/internal/sanity-buttons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/design-system/components/ui/sheet";
import { Link } from "@repo/internationalization/navigation";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { MenuLink } from "@/components/menu-link";
import type { NavigationData } from "@/types";

export const MobileMenu = ({
  navigation,
  siteName,
}: Pick<NavigationData, "navigation"> & { siteName: string }) => {
  const t = useTranslations("common");
  const pathname = usePathname();
  // The pathname the menu was opened on: navigating away closes it without an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);
  const close = () => setOpen(false);
  const { columns, buttons } = navigation ?? {};

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        render={
          <Button aria-label={t("openMenu")} size="icon" variant="ghost" />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md" side="right">
        <SheetHeader>
          <SheetTitle>{siteName}</SheetTitle>
        </SheetHeader>
        <nav
          aria-label={t("mainNavigation")}
          className="grid flex-1 content-start gap-1 overflow-y-auto px-4"
        >
          <Accordion>
            {columns?.map((column) => {
              if (column.type === "link") {
                if (!column.href) {
                  return null;
                }
                return (
                  <Link
                    className="hover-surface focus-ring-inset flex items-center rounded-md px-3 py-3 font-medium"
                    href={column.href}
                    key={column._key}
                    onClick={close}
                  >
                    {column.name}
                  </Link>
                );
              }
              if (column.type === "column") {
                return (
                  <AccordionItem
                    className="border-b-0"
                    key={column._key}
                    value={column._key}
                  >
                    <AccordionTrigger className="px-3 py-3 font-medium hover:no-underline">
                      {column.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border-border ml-1 grid gap-1 border-l-2 pl-3">
                        {column.links?.map((link) => (
                          <MenuLink
                            description={link.description}
                            href={link.href}
                            icon={link.icon}
                            key={link._key}
                            name={link.name}
                            onClick={close}
                            openInNewTab={link.openInNewTab}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }
              return null;
            })}
          </Accordion>
        </nav>
        {buttons?.length ? (
          <div className="border-border mt-auto grid border-t px-4 py-4">
            <SanityButtons
              buttonClassName="w-full justify-center"
              buttons={buttons}
              className="grid gap-3"
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};
