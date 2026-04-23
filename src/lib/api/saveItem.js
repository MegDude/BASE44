import { postJson } from "@/lib/api/client";

export function saveItem(payload) {
  return postJson("/api/save", payload);
}
