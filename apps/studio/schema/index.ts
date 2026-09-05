import { blockSchemas } from "@repo/blocks/schemas";

import { definitions } from "./definitions";
import { documents } from "./documents";

export const schemaTypes = [...documents, ...definitions, ...blockSchemas];

const documentNames = documents.map(({ name }) => name);
export type DocumentTypeName = (typeof documentNames)[number];
