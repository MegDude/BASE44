import { postJson } from "@/lib/api/client";

export function trackImpression(payload) {
  return postJson("/api/impression", payload);
}
