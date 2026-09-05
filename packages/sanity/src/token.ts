import "server-only";
import { keys } from "./keys";

const readToken = keys().SANITY_API_READ_TOKEN;

if (!readToken) {
  throw new Error("Missing SANITY_API_READ_TOKEN");
}

export const token: string = readToken;
