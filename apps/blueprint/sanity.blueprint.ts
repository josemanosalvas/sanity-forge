import { existsSync } from "node:fs";

import {
  defineBlueprint,
  defineSyncTagInvalidateFunction,
} from "@sanity/blueprints";

// The Sanity CLI does not read .env files; values already set take precedence.
const envFile = new URL(".env", import.meta.url);
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const { SANITY_DATASET: dataset, SANITY_PROJECT_ID: projectId } = process.env;
if (!(projectId && dataset)) {
  // An unscoped Function would subscribe to every dataset in the project, and
  // Sanity allows only one sync tag Function per dataset.
  throw new Error(
    "Set SANITY_PROJECT_ID and SANITY_DATASET (see apps/blueprint/.env.example)."
  );
}

export default defineBlueprint({
  resources: [
    defineSyncTagInvalidateFunction({
      event: { resource: { id: `${projectId}.${dataset}`, type: "dataset" } },
      name: "invalidate-tags",
    }),
  ],
});
