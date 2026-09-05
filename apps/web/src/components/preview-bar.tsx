"use client";

import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";
import { useIsPresentationTool } from "next-sanity/hooks";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { disableDraftMode } from "@/app/actions/draft-mode";

/** Shown in Draft Mode outside Presentation, where the Studio owns the session. */
export const PreviewBar = () => {
  const isPresentationTool = useIsPresentationTool();
  const router = useRouter();
  const t = useTranslations("preview");
  const [pending, startTransition] = useTransition();

  // `null` means "still detecting"; inside Presentation the Studio owns draft mode.
  if (isPresentationTool !== false) {
    return null;
  }

  const disable = () => {
    startTransition(async () => {
      await disableDraftMode();
      router.refresh();
    });
  };

  return (
    <div className="fixed right-0 bottom-2 left-0 z-50 px-2 md:px-4">
      <div className="border-border bg-background/90 mx-auto flex max-w-md items-center gap-3 rounded-md border p-2 pl-3 text-sm shadow-md backdrop-blur">
        <p className="text-muted-foreground flex-1">
          {pending ? t("exiting") : t("message")}
        </p>
        <Button
          disabled={pending}
          onClick={disable}
          size="sm"
          variant="outline"
        >
          {t("exit")}
        </Button>
      </div>
    </div>
  );
};
