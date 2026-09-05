import type { ValidationContext } from "sanity";
import { describe, expect, test, vi } from "vitest";

import {
  internalPageFilter,
  linkedPageRule,
  linkTypeRule,
  SHARED_CONTENT_LINK_MESSAGE,
} from "./link-scope";

const page = { _type: "page", site: "brand-a" };
const faq = { _type: "faq" };

describe(internalPageFilter, () => {
  test("offers a site-scoped document its own site's pages", () => {
    expect(internalPageFilter(page)).toStrictEqual({
      filter: "site == $site",
      params: { site: "brand-a" },
    });
  });

  test.each([faq, { _type: "page" }, undefined])(
    "offers shared or unscoped content no page at all (%o)",
    (document) => {
      expect(internalPageFilter(document)).toStrictEqual({ filter: "false" });
    }
  );
});

describe(linkTypeRule, () => {
  test("lets site-scoped documents link internally", () => {
    expect(linkTypeRule("internal", page)).toBeTruthy();
  });

  test("keeps shared content on addresses", () => {
    expect(linkTypeRule("internal", faq)).toBe(SHARED_CONTENT_LINK_MESSAGE);
    expect(linkTypeRule("external", faq)).toBeTruthy();
  });
});

describe(linkedPageRule, () => {
  const context = (linkedSite: string | null) => {
    const fetch = vi
      .fn<() => Promise<string | null>>()
      .mockResolvedValue(linkedSite);
    return {
      context: {
        document: page,
        getClient: () => ({ fetch }),
      } as unknown as Pick<ValidationContext, "document" | "getClient">,
      fetch,
    };
  };

  test("accepts a page of the document's own site", async () => {
    const { context: ctx, fetch } = context("brand-a");
    await expect(
      linkedPageRule({ _ref: "pricing" }, ctx)
    ).resolves.toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("$id"),
      { id: "pricing" },
      { perspective: "raw" }
    );
  });

  test("rejects a page that now belongs to another site, by name", async () => {
    const { context: ctx } = context("brand-b");
    await expect(linkedPageRule({ _ref: "pricing" }, ctx)).resolves.toContain(
      "Brand B"
    );
  });

  test("leaves a missing page and an empty reference to the other rules", async () => {
    const { context: ctx, fetch } = context(null);
    await expect(linkedPageRule({ _ref: "gone" }, ctx)).resolves.toBeTruthy();
    await expect(linkedPageRule(undefined, ctx)).resolves.toBeTruthy();
    expect(fetch).toHaveBeenCalledOnce();
  });
});
