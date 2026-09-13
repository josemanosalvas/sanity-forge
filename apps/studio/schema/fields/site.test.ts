import { siteList } from "@repo/internationalization/sites";
import { describe, expect, test } from "vitest";

import { siteField } from "./site";

describe("site field", () => {
  test("is read-only, so only the Structure's templates set the site", () => {
    expect(siteField.readOnly).toBeTruthy();
  });

  test("stays visible and names every registered site", () => {
    expect("hidden" in siteField).toBeFalsy();
    expect(siteField.options?.list).toStrictEqual(
      siteList.map((site) => ({ title: site.name, value: site.key }))
    );
  });
});
