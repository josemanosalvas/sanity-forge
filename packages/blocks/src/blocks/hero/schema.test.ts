import type { ValidationContext } from "sanity";
import { describe, expect, test, vi } from "vitest";

import { heroVideoField, validateHeroVariant } from "./schema";

interface FieldLike {
  name: string;
  hidden?: (context: { parent?: unknown }) => boolean;
  fields?: FieldLike[];
}

const lightFields = (
  heroVideoField as unknown as { fields: FieldLike[] }
).fields.find((field) => field.name === "light")?.fields;

const isHidden = (name: string, parent: unknown) => {
  const field = lightFields?.find((candidate) => candidate.name === name);
  if (!field?.hidden) {
    throw new Error(`no hidden rule on ${name}`);
  }
  return field.hidden({ parent });
};

describe("hero media type inference in the Studio", () => {
  test("uploaded files without a selection show the file fields", () => {
    const parent = { webm: { asset: { _ref: "file-a-webm" } } };
    expect(isHidden("webm", parent)).toBeFalsy();
    expect(isHidden("hevc", parent)).toBeFalsy();
    expect(isHidden("mux", parent)).toBeTruthy();
  });

  test("a Mux asset without a selection shows the Mux field", () => {
    const parent = { mux: { asset: { _ref: "mux-asset" } } };
    expect(isHidden("mux", parent)).toBeFalsy();
    expect(isHidden("webm", parent)).toBeTruthy();
  });

  test("an explicit selection wins", () => {
    const parent = { mediaType: "mux-mp4", webm: { asset: { _ref: "x" } } };
    expect(isHidden("mux", parent)).toBeFalsy();
    expect(isHidden("webm", parent)).toBeTruthy();
  });
});

const contextFor = (asset: unknown) => {
  const fetch = vi
    .fn<(query: string, params: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue(asset);
  const context = {
    getClient: () =>
      ({ fetch }) as unknown as ReturnType<ValidationContext["getClient"]>,
  };
  return { context, fetch };
};

const muxRef = { mux: { asset: { _ref: "mux-asset" } } };

describe(validateHeroVariant, () => {
  test("a public, ready Mux asset passes", async () => {
    const { context } = contextFor({ policy: "public", status: "ready" });
    await expect(validateHeroVariant(muxRef, context)).resolves.toBeTruthy();
  });

  test("a failed encode warns that the site falls back", async () => {
    const { context } = contextFor({ policy: "public", status: "errored" });
    await expect(validateHeroVariant(muxRef, context)).resolves.toMatch(
      /could not process/u
    );
  });

  test("a non-public playback policy warns", async () => {
    const { context } = contextFor({ policy: "signed", status: "ready" });
    await expect(validateHeroVariant(muxRef, context)).resolves.toMatch(
      /signed playback policy/u
    );
  });

  test("a missing playback ID warns without calling it an error", async () => {
    const { context } = contextFor({ status: "preparing" });
    await expect(validateHeroVariant(muxRef, context)).resolves.toMatch(
      /not issued a playback ID/u
    );
  });

  test("the Sanity path and mismatched uploads are judged without a fetch", async () => {
    const { context, fetch } = contextFor({ status: "errored" });
    await expect(
      validateHeroVariant({ webm: { asset: { _ref: "file" } } }, context)
    ).resolves.toBeTruthy();
    await expect(
      validateHeroVariant(
        { mediaType: "mux", webm: { asset: { _ref: "file" } } },
        context
      )
    ).resolves.toMatch(/Set to Mux/u);
    await expect(
      validateHeroVariant({ mediaType: "sanity", ...muxRef }, context)
    ).resolves.toMatch(/Set to Sanity/u);
    expect(fetch).not.toHaveBeenCalled();
  });
});
