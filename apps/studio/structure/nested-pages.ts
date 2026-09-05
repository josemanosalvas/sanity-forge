import type { Locale } from "@repo/internationalization/locales";
import type { SiteKey } from "@repo/internationalization/sites";
import { friendlyWords } from "friendlier-words";
import { File, Folder } from "lucide-react";
import { getPublishedId } from "sanity";
import type { ListItemBuilder, StructureBuilder } from "sanity/structure";

import { API_VERSION } from "../lib/constants";
import { getTitleCase } from "../lib/helpers";

interface DocumentData {
  _id: string;
  title: string;
  slug: string;
}

interface FolderNode {
  title: string;
  path: string;
  count: number;
  documents: DocumentData[];
  children: Record<string, FolderNode>;
}

interface StructureOptions {
  depth?: number;
  parentPath?: string;
}

type SanityListItem = ListItemBuilder | ReturnType<StructureBuilder["divider"]>;

const DOCUMENTS_QUERY = `
  *[_type == $schemaType && site == $site && language == $language && defined(slug.current)] {
      _id,
      title,
      "slug": slug.current
    }
`;

// Drafts and published docs both come back from the query; collapse to one row.
const deduplicateDocuments = (documents: DocumentData[]): DocumentData[] => {
  const documentMap = new Map<string, DocumentData>();

  for (const doc of documents) {
    if (!(doc._id && doc.slug)) {
      continue;
    }

    const normalizedId = getPublishedId(doc._id);
    if (!(documentMap.has(normalizedId) && doc._id.startsWith("drafts."))) {
      documentMap.set(normalizedId, {
        ...doc,
        _id: normalizedId,
      });
    }
  }

  return [...documentMap.values()];
};

// Each "/" in a slug becomes a folder level, so /a/b/c nests three deep.
const processDocumentIntoStructure = (
  doc: DocumentData,
  folderStructure: Record<string, FolderNode>
): void => {
  if (!doc.slug) {
    return;
  }

  const segments = doc.slug.split("/").filter(Boolean);
  const [firstSegment] = segments;
  if (!firstSegment) {
    return;
  }

  folderStructure[firstSegment] ??= {
    title: getTitleCase(firstSegment),
    path: firstSegment,
    count: 0,
    documents: [],
    children: {},
  };
  const first = folderStructure[firstSegment];

  first.count++;

  if (segments.length === 1) {
    first.documents.push(doc);
    return;
  }

  let currentLevel = first.children;
  let currentPath = firstSegment;

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) {
      continue;
    }
    currentPath = `${currentPath}/${segment}`;

    currentLevel[segment] ??= {
      title: getTitleCase(segment),
      path: currentPath,
      count: 0,
      documents: [],
      children: {},
    };
    const node = currentLevel[segment];

    node.count++;

    if (i === segments.length - 1) {
      node.documents.push(doc);
    }

    currentLevel = node.children;
  }
};

const buildFolderStructure = (
  documents: DocumentData[]
): Record<string, FolderNode> => {
  const folderStructure: Record<string, FolderNode> = {};

  for (const doc of documents) {
    processDocumentIntoStructure(doc, folderStructure);
  }

  return folderStructure;
};

const compareAlpha = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { sensitivity: "base" });

const byDocumentTitle = (a: DocumentData, b: DocumentData): number =>
  compareAlpha(a.title || a.slug, b.title || b.slug);

const createUniqueId = (
  type: "folder" | "doc" | "main" | "single",
  parentPath: string,
  key: string,
  depth: number
): string => `${type}-${parentPath}${key}-${depth}`;

const createDocumentListItems = (
  S: StructureBuilder,
  documents: DocumentData[],
  schemaType: string,
  uniqueId: string
): ListItemBuilder[] =>
  documents.map((doc, docIndex) =>
    S.listItem()
      .id(`doc-${uniqueId}-${docIndex}`)
      .title(doc.title || "Untitled")
      .icon(File)
      .child(S.document().documentId(doc._id).schemaType(schemaType))
  );

const createMainPageListItem = (
  S: StructureBuilder,
  mainPageDoc: DocumentData,
  schemaType: string,
  uniqueId: string
): ListItemBuilder =>
  S.listItem()
    .id(`main-${uniqueId}`)
    .title(mainPageDoc.title || "Untitled")
    .icon(Folder)
    .child(S.document().documentId(mainPageDoc._id).schemaType(schemaType));

interface FolderContext {
  site: SiteKey;
  language: Locale;
  templateId: string;
}

// Folders get an "Add page" action pre-filled with a random child slug.
const createFolderListItem = (
  S: StructureBuilder,
  folder: FolderNode,
  uniqueId: string,
  listItems: SanityListItem[],
  { site, language, templateId }: FolderContext
): ListItemBuilder => {
  const pageSlug = friendlyWords();
  const pageTitle = getTitleCase(pageSlug);

  return S.listItem()
    .id(uniqueId)
    .title(`${folder.title} (${folder.count})`)
    .icon(Folder)
    .child(
      S.list()
        .title(folder.title)
        .items(listItems)
        .menuItems([
          {
            title: "Add page",
            intent: {
              type: "create",
              params: [
                { type: "page", template: templateId },
                {
                  site,
                  language,
                  slug: `/${folder.path}/${pageSlug}`,
                  title: `${folder.title} > ${pageTitle}`,
                },
              ],
            },
          },
        ])
    );
};

const createSingleDocumentListItem = (
  S: StructureBuilder,
  doc: DocumentData,
  schemaType: string
): ListItemBuilder =>
  S.listItem()
    .id(`single-${doc._id}`)
    .title(doc.title || "Untitled")
    .icon(File)
    .child(S.document().documentId(doc._id).schemaType(schemaType));

interface FolderProcessConfig {
  S: StructureBuilder;
  key: string;
  folder: FolderNode;
  depth: number;
  parentPath: string;
  schemaType: string;
  context: FolderContext;
  createListItemsFromStructure: (
    structure: Record<string, FolderNode>,
    options?: StructureOptions
  ) => SanityListItem[];
}

const processFolderItem = (config: FolderProcessConfig): ListItemBuilder => {
  const {
    S,
    key,
    folder,
    depth,
    parentPath,
    schemaType,
    context,
    createListItemsFromStructure,
  } = config;
  const uniqueId = createUniqueId("folder", parentPath, key, depth);

  const childFolderItems =
    Object.keys(folder.children).length > 0
      ? createListItemsFromStructure(folder.children, {
          depth: depth + 1,
          parentPath: `${key}-`,
        })
      : [];

  const listItems: SanityListItem[] = [];

  const mainPageDoc = folder.documents.find(
    (doc) => doc.slug === `/${folder.path}`
  );
  const otherDocs = folder.documents
    .filter((doc) => doc._id !== mainPageDoc?._id)
    .toSorted(byDocumentTitle);

  if (otherDocs.length > 0) {
    listItems.push(
      ...createDocumentListItems(S, otherDocs, schemaType, uniqueId)
    );
  }

  if (childFolderItems.length > 0) {
    if (otherDocs.length > 0) {
      listItems.push(S.divider());
    }
    listItems.push(...childFolderItems);
  }

  if (mainPageDoc) {
    if (otherDocs.length > 0 || childFolderItems.length > 0) {
      listItems.push(S.divider());
    }
    listItems.push(
      createMainPageListItem(S, mainPageDoc, schemaType, uniqueId)
    );
  }

  return createFolderListItem(S, folder, uniqueId, listItems, context);
};

const combineItemsWithDividers = (
  S: StructureBuilder,
  folders: ListItemBuilder[],
  files: ListItemBuilder[]
): SanityListItem[] => {
  const result: SanityListItem[] = [];

  if (folders.length > 0) {
    result.push(...folders);
  }

  if (folders.length > 0 && files.length > 0) {
    result.push(S.divider());
  }

  if (files.length > 0) {
    result.push(...files);
  }

  return result;
};

/**
 * A folder tree of one site's pages in one language, derived from their
 * slugs (`/pricing/teams` nests under `/pricing`), with the flat list on top.
 */
export const createPagesByPathList = (
  S: StructureBuilder,
  {
    schemaType,
    site,
    language,
    templateId,
  }: { schemaType: string } & FolderContext
) =>
  S.list()
    .title("Pages by path")
    .items([])
    .child(async () => {
      const context: FolderContext = { site, language, templateId };
      try {
        const client = S.context.getClient({ apiVersion: API_VERSION });
        const documents = await client.fetch<DocumentData[]>(DOCUMENTS_QUERY, {
          schemaType,
          site,
          language,
        });
        const uniqueDocuments = deduplicateDocuments(documents);
        const folderStructure = buildFolderStructure(uniqueDocuments);

        const createListItemsFromStructure = (
          structure: Record<string, FolderNode>,
          options: StructureOptions = {}
        ): SanityListItem[] => {
          const { depth = 0, parentPath = "" } = options;
          const folders: ListItemBuilder[] = [];
          const looseDocs: DocumentData[] = [];

          const sortedEntries = Object.entries(structure).toSorted(([a], [b]) =>
            compareAlpha(a, b)
          );

          for (const [key, folder] of sortedEntries) {
            const hasChildren = Object.keys(folder.children).length > 0;
            const totalItems =
              Object.keys(folder.children).length + folder.documents.length;
            const [onlyDocument] = folder.documents;

            if (totalItems > 1 || hasChildren) {
              folders.push(
                processFolderItem({
                  S,
                  key,
                  folder,
                  depth,
                  parentPath,
                  schemaType,
                  context,
                  createListItemsFromStructure,
                })
              );
            } else if (onlyDocument) {
              looseDocs.push(onlyDocument);
            }
          }

          const files = looseDocs
            .toSorted(byDocumentTitle)
            .map((doc) => createSingleDocumentListItem(S, doc, schemaType));

          return combineItemsWithDividers(S, folders, files);
        };

        return S.list()
          .title("Pages by path")
          .items(createListItemsFromStructure(folderStructure));
      } catch {
        return S.list().title("Pages by path").items([]);
      }
    });
