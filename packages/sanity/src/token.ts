import "server-only";
import { keys } from "../keys";

/**
 * Viewer token for draft and release perspectives, Visual Editing and
 * preview secrets. Required wherever Sanity Live runs; failing here at
 * module load beats a deployment that silently serves published content only.
 */
const readToken = keys().SANITY_API_READ_TOKEN;

if (!readToken) {
  throw new Error("Missing SANITY_API_READ_TOKEN");
}

export const token: string = readToken;
