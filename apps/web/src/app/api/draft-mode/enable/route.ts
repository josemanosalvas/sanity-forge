import { client } from "@repo/sanity/client";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

/**
 * Presentation opens this URL with a preview secret; next-sanity validates
 * it with the client's viewer token, enables Draft Mode and redirects to the
 * requested page.
 */
export const { GET } = defineEnableDraftMode({ client });
