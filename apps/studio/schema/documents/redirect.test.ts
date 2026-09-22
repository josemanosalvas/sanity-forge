/* oxlint-disable vitest/prefer-to-be-truthy -- Validation succeeds only for true; error strings are truthy. */
import { evaluate, parse } from "groq-js";
import type { ValidationContext } from "sanity";
import { describe, expect, test, vi } from "vitest";

import { redirectDestinationRule, redirectSourceRule } from "./redirect";

interface Row {
  _id: string;
  _type: "redirect";
  site: string;
  destination: { current: string };
  source: { current: string };
}

const path = (current: string) => ({ _type: "slug" as const, current });

// Replace network I/O only; evaluate the validator's actual query against documents.
const context = (rows: Row[], document: Record<string, unknown>) => {
  const fetch = vi.fn<
    (query: string, params: Record<string, unknown>) => Promise<unknown>
  >(async (query: string, params: Record<string, unknown>) => {
    const result = await evaluate(parse(query), { dataset: rows, params });
    return result.get();
  });
  return {
    context: {
      document,
      getClient: () => ({ fetch }),
    } as unknown as Pick<ValidationContext, "document" | "getClient">,
    fetch,
  };
};

const editing = (
  source: string,
  destination: string,
  rows: Row[] = [],
  _id = "r-new"
) =>
  context(rows, {
    _id,
    _type: "redirect",
    destination: path(destination),
    site: "brand-a",
    source: path(source),
  });

const OLD_TO_NEW: Row = {
  _id: "r-1",
  _type: "redirect",
  destination: path("/new"),
  site: "brand-a",
  source: path("/old"),
};

describe(redirectSourceRule, () => {
  test("lets a second old path be consolidated onto a destination in use", async () => {
    const { context: ctx } = editing("/older", "/new", [OLD_TO_NEW]);
    await expect(redirectSourceRule(path("/older"), ctx)).resolves.toBe(true);
  });

  test("rejects a second redirect from the same source", async () => {
    const { context: ctx } = editing("/old", "/other", [OLD_TO_NEW]);
    await expect(redirectSourceRule(path("/old"), ctx)).resolves.toContain(
      "already sends /old to /new"
    );
  });

  test("rejects the return leg of a cycle", async () => {
    const { context: ctx } = editing("/new", "/old", [OLD_TO_NEW]);
    await expect(redirectSourceRule(path("/new"), ctx)).resolves.toContain(
      "redirected twice"
    );
  });

  test("rejects a chain that starts where another redirect ends", async () => {
    const { context: ctx } = editing("/new", "/newest", [OLD_TO_NEW]);
    await expect(redirectSourceRule(path("/new"), ctx)).resolves.toContain(
      "/old already points at this path"
    );
  });

  test("rejects a blank, malformed or self-pointing source", async () => {
    const { context: ctx, fetch } = editing("/old", "/old");
    await expect(redirectSourceRule(undefined, ctx)).resolves.toBe(
      "Can't be blank"
    );
    await expect(
      redirectSourceRule(path("old page"), ctx)
    ).resolves.toStrictEqual(expect.any(String));
    await expect(
      redirectSourceRule(path("/old?ref=x"), ctx)
    ).resolves.toStrictEqual(expect.any(String));
    await expect(redirectSourceRule(path("/old"), ctx)).resolves.toBe(
      "Source and destination cannot be the same URL"
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe(redirectDestinationRule, () => {
  test("lets a second old path be consolidated onto a destination in use", async () => {
    const { context: ctx } = editing("/older", "/new", [OLD_TO_NEW]);
    await expect(redirectDestinationRule(path("/new"), ctx)).resolves.toBe(
      true
    );
  });

  test("rejects a destination that is itself redirected", async () => {
    const { context: ctx } = editing("/oldest", "/old", [OLD_TO_NEW]);
    await expect(redirectDestinationRule(path("/old"), ctx)).resolves.toContain(
      "Point this redirect at /new instead"
    );
  });

  test("keeps a query string but rejects a blank or malformed destination", async () => {
    const { context: ctx } = editing("/old", "/new?ref=old");
    await expect(
      redirectDestinationRule(path("/new?ref=old"), ctx)
    ).resolves.toBe(true);
    await expect(redirectDestinationRule(undefined, ctx)).resolves.toBe(
      "Can't be blank"
    );
    await expect(
      redirectDestinationRule(path("new page"), ctx)
    ).resolves.toStrictEqual(expect.any(String));
  });
});

describe("every version of the redirect being edited", () => {
  test.each(["r-1", "drafts.r-1", "versions.autumn.r-1"])(
    "does not conflict with its own published row (%s)",
    async (_id) => {
      const { context: ctx } = editing(
        "/old",
        "/new",
        [
          OLD_TO_NEW,
          { ...OLD_TO_NEW, _id: "drafts.r-1" },
          { ...OLD_TO_NEW, _id: "versions.autumn.r-1" },
        ],
        _id
      );

      await expect(redirectSourceRule(path("/old"), ctx)).resolves.toBe(true);
      await expect(redirectDestinationRule(path("/new"), ctx)).resolves.toBe(
        true
      );
    }
  );
});

describe("redirect scope", () => {
  test("ignores redirects on another site", async () => {
    const rows: Row[] = [{ ...OLD_TO_NEW, site: "brand-b" }];
    const { context: ctx } = editing("/old", "/new", rows);
    await expect(redirectSourceRule(path("/old"), ctx)).resolves.toBe(true);
    const { context: destinationContext } = editing("/older", "/old", rows);
    await expect(
      redirectDestinationRule(path("/old"), destinationContext)
    ).resolves.toBe(true);
  });

  test.each(["drafts.r-2", "versions.autumn.r-2"])(
    "checks other documents' unpublished versions (%s)",
    async (_id) => {
      const { context: ctx } = editing("/old", "/elsewhere", [
        { ...OLD_TO_NEW, _id },
      ]);
      await expect(redirectSourceRule(path("/old"), ctx)).resolves.toContain(
        "already sends /old to /new"
      );
      const { context: destinationContext } = editing("/older", "/old", [
        { ...OLD_TO_NEW, _id },
      ]);
      await expect(
        redirectDestinationRule(path("/old"), destinationContext)
      ).resolves.toContain("Point this redirect at /new instead");
    }
  );
});
