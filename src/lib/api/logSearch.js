import { postJson } from "@/lib/api/client";

export function logSearch(payload) {
  return postJson("/api/search-log", payload);
}
