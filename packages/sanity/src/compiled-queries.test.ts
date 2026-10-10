import { encodedQueryLength, GET_QUERY_LIMIT } from "groq-compiler/budget";
import { compiledQuery } from "groq-compiler/sanity";
import { describe, expect, it } from "vitest";

import { compiledQueries } from "./compiled-queries";
import { seedCases } from "./testing/seed";

// The longest parameters the seed content uses, so each query's GET budget is measured at its worst.
const longestParams = (sets: Record<string, unknown>[]) => {
  let longest: Record<string, unknown> = {};
  for (const params of sets) {
    if (JSON.stringify(params).length > JSON.stringify(longest).length) {
      longest = params;
    }
  }
  return longest;
};

describe("compiled queries", () => {
  it.each(seedCases)(
    "$name fits @sanity/client's GET budget once compiled",
    ({ query, params }) => {
      const compiled = compiledQuery(compiledQueries, query);
      expect(encodedQueryLength(compiled, longestParams(params))).toBeLessThan(
        GET_QUERY_LIMIT
      );
    }
  );

  it("compiles the page query below the budget it exceeds as written", () => {
    const page = seedCases.find((c) => c.name === "pageQuery");
    expect(page).toBeDefined();
    const params = longestParams(page?.params ?? [{}]);
    expect(
      encodedQueryLength(page?.query ?? "", params)
    ).toBeGreaterThanOrEqual(GET_QUERY_LIMIT);
    expect(
      encodedQueryLength(
        compiledQuery(compiledQueries, page?.query ?? ""),
        params
      )
    ).toBeLessThan(GET_QUERY_LIMIT);
  });

  it("maps only queries that TypeGen knows", () => {
    const known = new Set(seedCases.map((c) => c.query));
    for (const original of compiledQueries.keys()) {
      expect(known.has(original)).toBeTruthy();
    }
  });
});
