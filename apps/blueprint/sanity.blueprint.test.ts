import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The CLI calls the default export to resolve the Blueprint.
const load = async () => {
  const { default: blueprint } = await import("./sanity.blueprint");
  return blueprint();
};

describe("Blueprint", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("declares one sync tag Function, scoped to one dataset", async () => {
    vi.stubEnv("SANITY_PROJECT_ID", "abc123");
    vi.stubEnv("SANITY_DATASET", "production");
    const { resources } = await load();
    expect(resources).toMatchObject([
      {
        event: { resource: { id: "abc123.production", type: "dataset" } },
        name: "invalidate-tags",
        type: "sanity.function.sync-tag-invalidate",
      },
    ]);
  });

  it("refuses to declare a Function for every dataset", async () => {
    vi.stubEnv("SANITY_PROJECT_ID", "abc123");
    vi.stubEnv("SANITY_DATASET", "");
    await expect(load()).rejects.toThrow("SANITY_DATASET");
  });
});
