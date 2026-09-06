"use client";

import { SanityButtons } from "@repo/blocks/components/sanity-buttons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense, useState } from "react";

import { MenuLink } from "@/components/menu-link";
import { OnNavigate } from "@/components/on-navigate";
import type { NavigationData } from "@/types";

export const MobileMenu = ({
  navigation,
  siteName,
}: Pick<NavigationData, "navigation"> & { siteName: string }) => {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
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
      <SheetContent
        className="w-full sm:max-w-md"
        showCloseButton={false}
        side="right"
      >
        {/* Composed here so the close control carries the visitor's language. */}
        <SheetClose
          render={
            <Button
              className="absolute top-3 right-3"
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <X />
          <span className="sr-only">{t("closeMenu")}</span>
        </SheetClose>
        {/* Back/forward navigation closes the sheet too; link clicks close it directly. */}
        {open && (
          <Suspense>
            <OnNavigate onNavigate={close} />
          </Suspense>
        )}
        <SheetHeader>
          <SheetTitle>{siteName}</SheetTitle>
        </SheetHeader>
        <nav
          aria-label={t("mainNavigation")}
          className="grid flex-1 content-start gap-1 overflow-y-auto px-4"
        >
          <Accordion>
            {columns?.map((column) => {
              // `type` is stega-branded, so narrow on the shape instead.
              if ("href" in column) {
                if (!column.href) {
                  return null;
                }
                return (
                  <Link
                    className="hover-surface focus-ring-inset flex items-center rounded-md px-3 py-3 font-medium"
                    href={column.href}
                    key={column._key}
                    onClick={close}
                    rel={
                      column.openInNewTab ? "noopener noreferrer" : undefined
                    }
                    target={column.openInNewTab ? "_blank" : undefined}
                  >
                    {column.name}
                  </Link>
                );
              }
              if ("links" in column) {
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
