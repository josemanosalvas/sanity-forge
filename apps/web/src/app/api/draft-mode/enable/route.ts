import { client } from "@repo/sanity/client";
import { keys } from "@repo/sanity/keys";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

const token = keys().SANITY_API_READ_TOKEN;

/**
 * Presentation opens this URL with a preview secret; next-sanity validates
 * it, enables Draft Mode and redirects to the requested page. Without a
 * viewer token the site is published-only and preview is unavailable.
 */
const handler = token
  ? defineEnableDraftMode({ client: client.withConfig({ token }) })
  : {
      GET: () =>
        new Response("Draft Mode requires SANITY_API_READ_TOKEN", {
          status: 501,
        }),
    };

export const { GET } = handler;
