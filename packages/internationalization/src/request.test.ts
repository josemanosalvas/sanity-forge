import { describe, expect, test } from "vitest";

import { loadMessages, mergeMessages } from "./request";

describe(mergeMessages, () => {
  test("fills missing keys at any depth and keeps translated ones", () => {
    const merged = mergeMessages(
      {
        common: { next: "Next", theme: { dark: "Dark", light: "Light" } },
        footer: { copyright: "© {siteName}" },
      },
      { common: { theme: { dark: "Dunkel" } } }
    );
    expect(merged).toStrictEqual({
      common: { next: "Next", theme: { dark: "Dunkel", light: "Light" } },
      footer: { copyright: "© {siteName}" },
    });
  });

  test("a translated leaf replaces a fallback subtree of the same name", () => {
    expect(mergeMessages({ a: { b: "x" } }, { a: "flat" })).toStrictEqual({
      a: "flat",
    });
  });
});

const keyPaths = (tree: object, prefix = ""): string[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? keyPaths(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );

describe(loadMessages, () => {
  test("every locale exposes every English key path", async () => {
    const [en, de, fr] = await Promise.all([
      loadMessages("en"),
      loadMessages("de"),
      loadMessages("fr"),
    ]);
    const expected = keyPaths(en).toSorted();
    expect(keyPaths(de).toSorted()).toStrictEqual(expected);
    expect(keyPaths(fr).toSorted()).toStrictEqual(expected);
  });
});
