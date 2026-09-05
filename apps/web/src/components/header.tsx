import { Navbar } from "@/components/navbar";
import type { NavigationData, SiteContext } from "@/types";

export function Header({
  context,
  data,
}: {
  context: SiteContext;
  data: NavigationData;
}) {
  return (
    <Navbar
      navigation={data.navigation}
      settings={data.settings}
      siteName={data.settings?.siteTitle ?? context.site.name}
    />
  );
}
