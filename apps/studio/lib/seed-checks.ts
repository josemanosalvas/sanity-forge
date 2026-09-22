export interface SeedDocumentLike {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

type Node = Record<string, unknown>;

const isNode = (value: unknown): value is Node =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Visits every object in a document, depth first, with its dotted path. */
export const walk = (
  value: unknown,
  visit: (node: Node, path: string) => void,
  path = ""
): void => {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      walk(item, visit, `${path}[${index}]`);
    }
    return;
  }
  if (!isNode(value)) {
    return;
  }
  visit(value, path);
  for (const [key, item] of Object.entries(value)) {
    walk(item, visit, path ? `${path}.${key}` : key);
  }
};

export const parseNdjson = (text: string): SeedDocumentLike[] =>
  text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line) as SeedDocumentLike);

export interface Located {
  path: string;
  ref: string;
}

export const references = (document: SeedDocumentLike): Located[] => {
  const found: Located[] = [];
  walk(document, (node, path) => {
    if (node._type === "reference" && typeof node._ref === "string") {
      found.push({ path, ref: node._ref });
    }
  });
  return found;
};

export const internalLinks = (document: SeedDocumentLike): Located[] => {
  const found: Located[] = [];
  walk(document, (node, path) => {
    const { internal } = node;
    if (
      node._type === "customUrl" &&
      node.type === "internal" &&
      isNode(internal) &&
      typeof internal._ref === "string"
    ) {
      found.push({ path, ref: internal._ref });
    }
  });
  return found;
};

export const duplicateKeyPaths = (document: SeedDocumentLike): string[] => {
  const found: string[] = [];
  walk(document, (node, path) => {
    for (const [key, value] of Object.entries(node)) {
      if (!Array.isArray(value)) {
        continue;
      }
      const keys = value
        .filter(isNode)
        .map((item) => item._key)
        .filter((item): item is string => typeof item === "string");
      if (new Set(keys).size !== keys.length) {
        found.push(path ? `${path}.${key}` : key);
      }
    }
  });
  return found;
};

export interface SeedImage {
  path: string;
  source: string;
  alt: unknown;
  /** True where the schema defines an alt field: page images, screenshots and rich text images. */
  requiresAlt: boolean;
}

const lastSegment = (path: string) =>
  path
    .replace(/\[\d+\]$/u, "")
    .split(".")
    .at(-1);

export const images = (document: SeedDocumentLike): SeedImage[] => {
  const found: SeedImage[] = [];
  walk(document, (node, path) => {
    if (node._type !== "image" || typeof node._sanityAsset !== "string") {
      return;
    }
    const field = lastSegment(path);
    found.push({
      alt: node.alt,
      path,
      requiresAlt:
        field === "image" || field === "screenshot" || "caption" in node,
      source: node._sanityAsset,
    });
  });
  return found;
};

export const plainText = (value: unknown): string => {
  const parts: string[] = [];
  walk(value, (node) => {
    if (node._type === "span" && typeof node.text === "string") {
      parts.push(node.text);
    }
  });
  return parts.join(" ");
};
