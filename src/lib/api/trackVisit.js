import { postJson } from "@/lib/api/client";

export function trackVisit(payload) {
  return postJson("/api/visit", payload);
}
