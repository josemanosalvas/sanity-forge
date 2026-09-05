import type { DocumentRule } from "sanity";
import { describe, expect, test } from "vitest";

import { expectedSingletonId, singletonIdRule } from "./singletons";

type Validator = (document?: Record<string, unknown>) => unknown;

const passes: Validator = () => true;

/** Runs the rule's custom validator directly. */
const validator = (type: Parameters<typeof singletonIdRule>[0]): Validator => {
  let custom = passes;
  const rule = {
    custom: (fn: Validator) => {
      custom = fn;
      return rule;
    },
  } as unknown as DocumentRule;
  singletonIdRule(type)(rule);
  return custom;
};

describe(expectedSingletonId, () => {
  test("derives the ID from the site, and the language for localized types", () => {
    expect(expectedSingletonId("settings", { site: "brand-a" })).toBe(
      "settings-brand-a"
    );
    expect(
      expectedSingletonId("navigation", { language: "de", site: "brand-a" })
    ).toBe("navigation-brand-a-de");
    expect(
      expectedSingletonId("footer", { language: "fr", site: "brand-b" })
    ).toBe("footer-brand-b-fr");
  });

  test("has no answer while the scope is unknown or incomplete", () => {
    expect(
      expectedSingletonId("settings", { site: "brand-z" })
    ).toBeUndefined();
    expect(
      expectedSingletonId("navigation", { site: "brand-a" })
    ).toBeUndefined();
  });
});

describe(singletonIdRule, () => {
  const validate = validator("navigation");

  test.each([
    "navigation-brand-a-de",
    "drafts.navigation-brand-a-de",
    "versions.r1.navigation-brand-a-de",
  ])("accepts every version of the document the site reads (%s)", (_id) => {
    expect(validate({ _id, language: "de", site: "brand-a" })).toBeTruthy();
  });

  test("rejects a document the site never reads and says where the real one is", () => {
    const result = validate({
      _id: "8f2c1c1e-0d9e-4c8f-9c1a-3c1e0f6c2b7a",
      language: "de",
      site: "brand-a",
    });
    expect(result).toStrictEqual(expect.any(String));
    expect(result).toContain("Brand A");
    expect(result).toContain("Navigation → Deutsch");
  });

  test("leaves an incomplete scope to the site and language rules", () => {
    expect(validate({ _id: "anything", site: "brand-a" })).toBeTruthy();
    expect(validate()).toBeTruthy();
  });

  test("settings are scoped by site alone", () => {
    const validateSettings = validator("settings");
    expect(
      validateSettings({ _id: "settings-brand-b", site: "brand-b" })
    ).toBeTruthy();
    expect(
      validateSettings({ _id: "settings-copy", site: "brand-b" })
    ).toContain("Site settings");
  });
});
