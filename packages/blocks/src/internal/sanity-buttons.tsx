import { Button } from "@repo/ui/components/button";
import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";

import { sanitizeHref } from "./safe-href";

export interface ButtonProps {
  _key?: string | null;
  text?: string | null;
  variant?: string | null;
  href?: string | null;
  openInNewTab?: boolean | null;
}

type ButtonVariant = ComponentProps<typeof Button>["variant"];

interface SanityButtonsProps {
  buttons?: ButtonProps[] | null;
  className?: string;
  buttonClassName?: string;
  size?: "xs" | "sm" | "lg" | "default" | "icon" | null;
}

interface SanityButtonRenderProps {
  text?: string | null;
  href?: string | null;
  variant?: Exclude<ButtonVariant, null | undefined>;
  openInNewTab?: boolean | null;
  className?: string;
  size?: SanityButtonsProps["size"];
}

const VALID_VARIANTS = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;

const isValidVariant = (
  v: string | null | undefined
): v is Exclude<ButtonVariant, null | undefined> =>
  typeof v === "string" && (VALID_VARIANTS as readonly string[]).includes(v);

const SanityButton = ({
  text,
  href,
  variant = "default",
  openInNewTab,
  className,
  size,
}: Readonly<SanityButtonRenderProps>) => {
  const safeHref = sanitizeHref(href);
  if (!safeHref) {
    return <Button>Link Broken</Button>;
  }

  return (
    <Button
      className={cn("rounded-full", className)}
      render={
        <Link
          href={safeHref}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          target={openInNewTab ? "_blank" : "_self"}
        />
      }
      size={size ?? "default"}
      variant={variant ?? "default"}
    >
      {text}
      {openInNewTab ? (
        <span className="sr-only"> (opens in a new tab)</span>
      ) : null}
    </Button>
  );
};

export const SanityButtons = ({
  buttons,
  className,
  buttonClassName,
  size = "default",
}: Readonly<SanityButtonsProps>) => {
  if (!buttons?.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row", className)}>
      {buttons.map((button, index) => (
        <SanityButton
          className={buttonClassName}
          href={button.href}
          key={button._key ?? `button-${index}`}
          openInNewTab={button.openInNewTab}
          size={size}
          text={button.text}
          variant={isValidVariant(button.variant) ? button.variant : "default"}
        />
      ))}
    </div>
  );
};
