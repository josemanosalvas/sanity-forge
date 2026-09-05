import { Navbar } from "@/components/navbar";
import type { NavigationData, SiteContext } from "@/types";

export const Header = ({
  context,
  data,
}: {
  context: SiteContext;
  data: NavigationData;
}) => (
  <Navbar
    navigation={data.navigation}
    settings={data.settings}
    siteName={data.settings?.siteTitle ?? context.site.name}
  />
);
