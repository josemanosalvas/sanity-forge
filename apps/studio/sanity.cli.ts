import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
// Generated on the first `sanity deploy`; set it so later deploys target the
// same hosted app. https://www.sanity.io/docs/help/studio-host-user-applications
const appId = process.env.SANITY_STUDIO_APP_ID || undefined;

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    appId,
    autoUpdates: false,
  },
  // The schema is identical across workspaces, so one extraction serves
  // TypeGen in packages/sanity (see its sanity.cli.ts).
  schemaExtraction: {
    enabled: false,
    enforceRequiredFields: true,
    path: "schema.json",
    workspace: "brand-a",
  },
});
