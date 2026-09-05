import { getSite } from "@repo/internationalization/sites";
import { describe, expect, test } from "vitest";

import { createMetadata } from "./metadata";

describe(createMetadata, () => {
  test("writes og:locale as the locale's region tag with an underscore", () => {
    const metadata = createMetadata({
      route: { locale: "de", path: "/ueber-uns", site: getSite("brand-a") },
      siteName: "Brand A",
    });
    expect(metadata.openGraph).toMatchObject({
      locale: "de_DE",
      siteName: "Brand A",
    });
  });
});
