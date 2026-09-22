import { ConcreteRuleClass } from "sanity";
import type { Rule, ValidationContext } from "sanity";
import { describe, expect, test } from "vitest";

import { ogFields, seoFields } from "./seo";

interface FieldLike {
  name: string;
  validation?: (rule: Rule) => Rule | Rule[];
}

const overrideFields = [...seoFields, ...ogFields] as unknown as FieldLike[];

/**
 * Runs a field's rules the way the Studio does: against a rule that already
 * knows its type, because length validators do not resolve on an untyped one.
 */
const markersFor = async (name: string, value?: string) => {
  const field = overrideFields.find((candidate) => candidate.name === name);
  if (!field) {
    throw new Error(`no field named ${name}`);
  }
  if (!field.validation) {
    return [];
  }
  const built = field.validation(new ConcreteRuleClass().type("String"));
  const rules = Array.isArray(built) ? built : [built];
  const markers = await Promise.all(
    rules.map((rule) =>
      rule.validate(value, {} as unknown as ValidationContext)
    )
  );
  return markers.flat();
};

const DESCRIPTIONS = ["seoDescription", "ogDescription"];

describe("SEO and Open Graph override fields", () => {
  test("a blank override is never flagged, because it inherits from the page", async () => {
    const markers = await Promise.all(
      ["seoTitle", "seoDescription", "ogTitle", "ogDescription"].flatMap(
        (name) => [markersFor(name), markersFor(name, "")]
      )
    );
    expect(markers.flat()).toStrictEqual([]);
  });

  test("a description override warns only once it passes 160 characters", async () => {
    const atLimit = await Promise.all(
      DESCRIPTIONS.map((name) => markersFor(name, "x".repeat(160)))
    );
    expect(atLimit.flat()).toStrictEqual([]);

    const overLimit = await Promise.all(
      DESCRIPTIONS.map((name) => markersFor(name, "x".repeat(161)))
    );
    expect(overLimit.flat().map((marker) => marker.level)).toStrictEqual([
      "warning",
      "warning",
    ]);
  });
});
