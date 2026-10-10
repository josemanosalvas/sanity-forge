import { compiledQuery } from "groq-compiler/sanity";
import { evaluate, parse } from "groq-js";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { compiledQueries } from "./compiled-queries";
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
  query?: Record<string, unknown> | URLSearchParams;
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
  return { ms: 1, result: await value.get(), syncTags: ["seed-sync"] };
};

/** Loads `live.ts` with the flag set, its client answering through the Content Lake stand-in. */
const loadLive = async (
  compiled: boolean | undefined,
  requestHandler = contentLake
) => {
  vi.resetModules();
  vi.stubEnv(
    "SANITY_COMPILED_QUERIES",
    compiled === undefined ? undefined : String(compiled)
  );
  const { client } = await import("./client");
  client.config({ requestHandler });
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

describe.each([false, true])(
  "compiler opt-in with skipped validation=%s",
  (skipValidation) => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it.each([false, true, undefined])(
      "sends the expected query with flag=%s",
      async (flag) => {
        vi.stubEnv("SKIP_ENV_VALIDATION", String(skipValidation));
        vi.stubEnv("NEXT_PUBLIC_SANITY_API_VERSION", "2026-09-01");
        vi.stubEnv("NEXT_PUBLIC_SANITY_STUDIO_URL", "http://localhost:3333");
        const live = await loadLive(flag);
        const [page] = seedCases;
        sent.length = 0;
        await live.sanityFetch({
          params: page?.params[0],
          perspective: "published",
          query: page?.query ?? "",
          stega: false,
        });
        expect(sent.at(-1)).toBe(
          flag === true
            ? compiledQuery(compiledQueries, page?.query ?? "")
            : page?.query
        );
      }
    );
  }
);

describe("compiled preview and logging compatibility", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("preserves preview source maps, stega, tags and read logging", async () => {
    vi.stubEnv("SANITY_LOG_READS", "true");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const sourceMap = {
      documents: [{ _id: "page-preview", _type: "page" }],
      mappings: {
        "$['title']": {
          source: { document: 0, path: 0, type: "documentValue" },
          type: "value",
        },
      },
      paths: ["$['title']"],
    };
    const requests: ContentLakeRequest[] = [];
    const preview = await loadLive(true, (request: ContentLakeRequest) => {
      requests.push(request);
      return Promise.resolve({
        ms: 1,
        result: { title: "Preview title" },
        resultSourceMap: sourceMap,
        syncTags: ["preview-sync"],
      });
    });
    const [page] = seedCases;
    const result = await preview.sanityFetch({
      params: Promise.resolve(page?.params[0] ?? {}),
      perspective: "drafts",
      query: page?.query ?? "",
      stega: true,
      tags: ["custom-tag"],
    });
    expect(result).toMatchObject({
      data: { title: expect.stringMatching(/^Preview title.+$/u) },
      sourceMap,
      tags: expect.arrayContaining([
        "custom-tag",
        "sanity-content",
        "sanity-content:brand-a",
        "sanity:preview-sync",
      ]),
    });
    expect(requests.at(-1)?.query).toMatchObject({
      perspective: "drafts",
      resultSourceMap: "withKeyArraySelector",
    });
    expect(queryOf(requests.at(-1) ?? {}).query).toMatch(/^fn /u);
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/perspective=drafts .*syncTags=preview-sync/u)
    );
  });
});
