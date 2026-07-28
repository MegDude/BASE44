import { supabaseClient } from "@/lib/supabase/client";
import { getPartnerContentApiBaseUrl } from "@/lib/partner/partnerMapContentClient";
import type { ExperienceDraft } from "./experienceSystem";
import { buildExperiencePublishRequest } from "./experienceSystem";

export type PublishedExperience = {
  experienceId: string;
  campaignId: string;
  organizationId: string;
  status: "published";
  publishedAt?: string;
  idempotentReplay: boolean;
};

export async function publishExperience(draft: ExperienceDraft, idempotencyKey: string): Promise<PublishedExperience> {
  const baseUrl = getPartnerContentApiBaseUrl();
  const session = await supabaseClient?.auth.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  if (!token) throw new Error("Sign in to publish this experience.");

  const response = await fetch(`${baseUrl}/api/experiences`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(buildExperiencePublishRequest(draft)),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || "The experience could not be published. Your draft is still open.");
  }
  if (!body?.data?.experienceId || body.data.status !== "published") {
    throw new Error("Publishing finished without a valid experience record. Your draft is still open.");
  }
  return body.data as PublishedExperience;
}
