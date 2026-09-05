import "server-only";
import { keys } from "../keys";

/**
 * Viewer token for draft and release perspectives, Visual Editing and
 * preview secrets. Optional, unlike the official template: without it the
 * site is published-only and Draft Mode stays off, so a fork can deploy with
 * no secrets at all.
 */
export const token = keys().SANITY_API_READ_TOKEN;
