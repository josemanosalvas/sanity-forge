"use client";

import { SanityIcon } from "@repo/blocks/components/sanity-icon";
import Link from "next/link";

import { LinkStatus } from "@/components/link-status";

export const MenuLink = ({
  name,
  href,
  description,
  icon,
  openInNewTab,
  onClick,
}: {
  name?: string | null;
  href?: string | null;
  description?: string | null;
  icon?: string | null;
  openInNewTab?: boolean | null;
  onClick?: () => void;
}) => {
  if (!href) {
    return null;
  }

  return (
    <Link
      className="hover-surface focus-ring-inset group flex items-start gap-3 rounded-md p-3"
      href={href}
      onClick={onClick}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      target={openInNewTab ? "_blank" : undefined}
    >
      {icon && (
        <SanityIcon
          className="text-muted-foreground mt-0.5 size-4 shrink-0"
          icon={icon}
        />
      )}
      <span className="grid gap-1">
        <span className="text-foreground leading-none font-medium">
          {name}
          <LinkStatus />
        </span>
        {description && (
          <span className="text-muted-foreground line-clamp-2 text-sm">
            {description}
          </span>
        )}
      </span>
    </Link>
  );
};
