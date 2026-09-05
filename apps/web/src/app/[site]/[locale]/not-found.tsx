import { Button } from "@repo/design-system/components/ui/button";
import { Link } from "@repo/internationalization/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <section className="block-section">
      <div className="container grid max-w-2xl justify-items-center gap-8 py-24 text-center">
        <span className="border-border inline-flex items-center gap-2.5 border px-3 py-1.5 font-mono text-sm tracking-[0.28px] uppercase">
          <span className="bg-highlight size-2 shrink-0" />
          {t("eyebrow")}
        </span>
        <h1 className="text-[clamp(6rem,26vw,15rem)] leading-[0.8] font-normal tracking-tighter">
          404
        </h1>
        <h2 className="max-w-2xl text-3xl font-normal tracking-tight text-balance sm:text-4xl">
          {t("title")}
        </h2>
        <Button render={<Link href="/" />} size="lg" variant="secondary">
          {t("cta")}
        </Button>
      </div>
    </section>
  );
}
