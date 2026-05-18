import { base44Api } from "@/lib/api/base44Api";

const DEMO_RESIDENT_ID = "demo-resident";

async function invokeMutation(functionName, payload) {
  const response = await base44Api.invoke(functionName, payload);
  if (response?.error) {
    return { success: false, error: response.error };
  }
  return response?.data || response || { success: true };
}

export const residentMutationsRepository = {
  toggleSavedItem({ residentId = DEMO_RESIDENT_ID, item }) {
    return invokeMutation("toggleSavedItem", {
      resident_id: residentId,
      entity_id: item?.entity_id || item?.id,
      entity_type: item?.entity_type || item?.type,
      title: item?.title || item?.name,
    });
  },

  upsertRsvp({ residentId = DEMO_RESIDENT_ID, item, status = "going" }) {
    return invokeMutation("upsertResidentRsvp", {
      resident_id: residentId,
      entity_id: item?.entity_id || item?.id,
      entity_type: item?.entity_type || item?.type || "event",
      status,
      title: item?.title || item?.name,
    });
  },

  createRedemption({ residentId = DEMO_RESIDENT_ID, item }) {
    return invokeMutation("createResidentPerkRedemption", {
      resident_id: residentId,
      entity_id: item?.entity_id || item?.id,
      entity_type: item?.entity_type || item?.type,
      title: item?.title || item?.name,
      venue_id: item?.metadata?.venue_id || item?.entity_id || item?.id,
    });
  },

  logInteraction({ residentId = DEMO_RESIDENT_ID, item, action, query, metadata = {} }) {
    return invokeMutation("logResidentInteraction", {
      resident_id: residentId,
      entity_id: item?.entity_id || item?.id,
      entity_type: item?.entity_type || item?.type,
      action,
      query,
      metadata,
    });
  },
};
