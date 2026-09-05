import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import * as lucideMock from "./lucide-react.mock";

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(full);
    }
    return /\.tsx?$/u.test(entry.name) ? [full] : [];
  });

describe("testing/lucide-mock-coverage", () => {
  const SRC_DIR = path.join(import.meta.dirname, "../..");
  const LUCIDE_IMPORT =
    /import\s*\{(?<names>[^}]+)\}\s*from\s*"lucide-react"/gu;

  const importedIcons = (): Set<string> => {
    const icons = new Set<string>();
    for (const file of sourceFiles(SRC_DIR)) {
      const source = readFileSync(file, "utf-8");
      for (const match of source.matchAll(LUCIDE_IMPORT)) {
        const names = match.groups?.names ?? "";
        for (const name of names.split(",")) {
          const identifier = name.replace(/\btype\b/u, "").trim();
          if (identifier) {
            icons.add(identifier);
          }
        }
      }
    }
    return icons;
  };

  // A lucide icon that is imported by a component but missing from the mock
  // resolves to `undefined`, and React fails the entire render with "Element
  // type is invalid" — which reads as an unrelated component bug.
  test("every lucide icon used in src is stubbed in the mock", () => {
    const missing = [...importedIcons()]
      .filter((icon) => !(icon in lucideMock))
      .toSorted();

    expect(missing).toStrictEqual([]);
  });
});
