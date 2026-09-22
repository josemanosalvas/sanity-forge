import { describe, expect, test } from "vitest";

import en from "../messages/en.json";
import { loadMessages, mergeMessages } from "./request";
import type { MessageLoaders } from "./request";

describe(mergeMessages, () => {
  test("fills missing keys at any depth and keeps translated ones", () => {
    const merged = mergeMessages(en, {
      common: { theme: { dark: "Dunkel" } },
    });
    expect(merged.common.theme).toStrictEqual({
      ...en.common.theme,
      dark: "Dunkel",
    });
    expect(merged.footer).toStrictEqual(en.footer);
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
    const [english, de, fr] = await Promise.all([
      loadMessages("en"),
      loadMessages("de"),
      loadMessages("fr"),
    ]);
    const expected = keyPaths(english).toSorted();
    expect(keyPaths(de).toSorted()).toStrictEqual(expected);
    expect(keyPaths(fr).toSorted()).toStrictEqual(expected);
  });

  test("an incomplete locale file still yields the complete message set", async () => {
    const loaders: MessageLoaders = {
      de: () =>
        Promise.resolve({
          default: { common: { closeMenu: "Menü schließen" } },
        }),
      en: () => import("../messages/en.json"),
      fr: () => import("../messages/fr.json"),
    };
    const de = await loadMessages("de", loaders);
    expect(de.common.closeMenu).toBe("Menü schließen");
    expect(de.common.openMenu).toBe(en.common.openMenu);
    expect(keyPaths(de).toSorted()).toStrictEqual(keyPaths(en).toSorted());
  });
});
