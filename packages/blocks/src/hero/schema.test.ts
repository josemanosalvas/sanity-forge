import { describe, expect, test } from "vitest";

import { heroVideoField } from "./schema";

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

/** Documents authored before `mediaType` existed must show what the site serves. */
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
