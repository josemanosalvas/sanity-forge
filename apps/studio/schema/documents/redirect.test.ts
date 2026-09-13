import type { ValidationContext } from "sanity";
import { describe, expect, test, vi } from "vitest";

import { redirectDestinationRule, redirectSourceRule } from "./redirect";

interface Row {
  _id: string;
  destination: string;
  source: string;
}

const path = (current: string) => ({ _type: "slug" as const, current });

/**
 * Answers both rules' GROQ from an in-memory table the way the dataset would:
 * `!sanity::versionOf($published)` drops every version of the document being
 * edited, so rows are keyed by their published ID.
 */
const context = (rows: Row[], document: Record<string, unknown>) => {
  const fetch = vi.fn<
    (
      query: string,
      params: { path: string; published: string }
    ) => Promise<{ destination: string; source: string } | null>
  >((query, params) => {
    const matchesDestination = query.includes("destination.current == $path");
    const conflict = rows.find(
      (row) =>
        row._id !== params.published &&
        (row.source === params.path ||
          (matchesDestination && row.destination === params.path))
    );
    return Promise.resolve(
      conflict
        ? { destination: conflict.destination, source: conflict.source }
        : null
    );
  });
  return {
    context: {
      document,
      getClient: () => ({ fetch }),
    } as unknown as Pick<ValidationContext, "document" | "getClient">,
    fetch,
  };
};

/** The redirect being edited, and whatever else the site already redirects. */
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
  destination: "/new",
  source: "/old",
};

describe(redirectSourceRule, () => {
  test("lets a second old path be consolidated onto a destination in use", async () => {
    const { context: ctx } = editing("/older", "/new", [OLD_TO_NEW]);
    await expect(redirectSourceRule(path("/older"), ctx)).resolves.toBeTruthy();
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
    await expect(
      redirectDestinationRule(path("/new"), ctx)
    ).resolves.toBeTruthy();
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
    ).resolves.toBeTruthy();
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
      const { context: ctx, fetch } = editing(
        "/old",
        "/new",
        [OLD_TO_NEW],
        _id
      );

      await expect(redirectSourceRule(path("/old"), ctx)).resolves.toBeTruthy();
      await expect(
        redirectDestinationRule(path("/new"), ctx)
      ).resolves.toBeTruthy();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("!sanity::versionOf($published)"),
        { path: "/old", published: "r-1", site: "brand-a" },
        { perspective: "raw" }
      );
    }
  );
});
