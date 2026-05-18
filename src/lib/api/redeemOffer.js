import { postJson } from "@/lib/api/client";

export function redeemOffer(payload) {
  return postJson("/api/redeem", payload);
}
