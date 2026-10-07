import { evaluate, parse } from "groq-js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { seedCases, seedDataset } from "./testing/seed";

// Cache tagging needs a Next.js request; the fetch path under it is what these tests cover.
vi.mock(import("next/cache"), () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}));

const sent: string[] = [];

interface ContentLakeRequest {
  url?: string;
  body?: unknown;
}

const queryOf = (request: ContentLakeRequest) => {
  if (request.body !== undefined) {
    const body = (
      typeof request.body === "string" ? JSON.parse(request.body) : request.body
    ) as { query: string; params?: Record<string, unknown> };
    return { params: body.params ?? {}, query: body.query };
  }
  const url = new URL(request.url ?? "", "https://test.api.sanity.io");
  const params: Record<string, unknown> = {};
  for (const [key, value] of url.searchParams) {
    if (key.startsWith("$")) {
      params[key.slice(1)] = JSON.parse(value);
    }
  }
  return { params, query: url.searchParams.get("query") ?? "" };
};

/** Content Lake stand-in: answers each request by evaluating its query with groq-js on the seed data. */
const contentLake = async (request: ContentLakeRequest) => {
  const { query, params } = queryOf(request);
  sent.push(query);
  const value = await evaluate(parse(query), { dataset: seedDataset, params });
  return { ms: 1, result: await value.get(), syncTags: [] };
};

/** Loads `live.ts` with the flag set, its client answering through the Content Lake stand-in. */
const loadLive = async (compiled: boolean) => {
  vi.resetModules();
  vi.stubEnv("SANITY_COMPILED_QUERIES", String(compiled));
  const { client } = await import("./client");
  client.config({ requestHandler: contentLake });
  return await import("./live");
};

const cases = seedCases.flatMap(({ name, query, params }) =>
  params.map((set) => ({
    label: JSON.stringify(set),
    name,
    params: set,
    query,
  }))
);

describe("sanityFetch with SANITY_COMPILED_QUERIES", () => {
  let plain: Awaited<ReturnType<typeof loadLive>>;
  let compiled: Awaited<ReturnType<typeof loadLive>>;

  beforeAll(async () => {
    plain = await loadLive(false);
    compiled = await loadLive(true);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it.each(cases)(
    "returns identical seed results: $name $label",
    async ({ query, params }) => {
      const options = {
        params,
        perspective: "published",
        query,
        stega: false,
      } as const;
      sent.length = 0;
      const expected = await plain.sanityFetch(options);
      expect(sent.at(-1)).toBe(query);
      const actual = await compiled.sanityFetch(options);
      expect(actual.data).toStrictEqual(expected.data);
    }
  );

  it("sends the compiled page query only with the flag", async () => {
    const [page] = seedCases;
    const options = {
      params: page?.params[0],
      perspective: "published",
      query: page?.query ?? "",
      stega: false,
    } as const;
    sent.length = 0;
    await plain.sanityFetch(options);
    await compiled.sanityFetch(options);
    expect(sent[0]).toBe(page?.query);
    expect(sent.at(-1)).toMatch(/^fn /u);
  });
});
