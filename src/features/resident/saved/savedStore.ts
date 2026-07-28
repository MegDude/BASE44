import { useEffect } from "react";
import { create } from "zustand";
import { supabaseClient } from "@/lib/supabase/client";

const STORAGE_KEY = "downtown-perks-card-items";
const CHANGE_EVENT = "dp:saved-entities-changed";

function readLocalIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? Array.from(new Set(parsed.map(String))) : [];
  } catch {
    return [];
  }
}

function persist(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: ids }));
}

type SavedEntity = {
  entityType: string;
  entityId: string;
  savedAt?: string;
  title?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
};

type SavedStore = {
  savedIds: string[];
  entities: Record<string, SavedEntity>;
  pending: Record<string, boolean>;
  profileId: string | null;
  replaceIds: (ids: string[]) => void;
  hydrate: (entities: SavedEntity[], profileId?: string | null) => void;
  setOptimistic: (entity: SavedEntity, saved: boolean) => void;
  setPending: (entityId: string, pending: boolean) => void;
};

export const useSavedStore = create<SavedStore>((set) => ({
  savedIds: readLocalIds(),
  entities: {},
  pending: {},
  profileId: null,
  replaceIds: (ids) => {
    const next = Array.from(new Set(ids.map(String)));
    persist(next);
    set({ savedIds: next });
  },
  hydrate: (entities, profileId = null) => {
    const normalized = entities.map((entity) => ({
      ...entity,
      entityType: String((entity as any).entityType || (entity as any).entity_type || "place"),
      entityId: String((entity as any).entityId || (entity as any).entity_id || ""),
      savedAt: String((entity as any).savedAt || (entity as any).saved_at || ""),
    })).filter((entity) => entity.entityId);
    const ids = normalized.map((entity) => entity.entityId);
    persist(ids);
    set({
      savedIds: ids,
      entities: Object.fromEntries(normalized.map((entity) => [`${entity.entityType}:${entity.entityId}`, entity])),
      profileId,
    });
  },
  setOptimistic: (entity, saved) => set((state) => {
    const entities = { ...state.entities };
    const key = `${entity.entityType}:${entity.entityId}`;
    if (saved) entities[key] = entity;
    else delete entities[key];
    const savedIds = saved
      ? Array.from(new Set([...state.savedIds, entity.entityId]))
      : state.savedIds.filter((id) => id !== entity.entityId);
    persist(savedIds);
    return { entities, savedIds };
  }),
  setPending: (entityId, pending) => set((state) => ({ pending: { ...state.pending, [entityId]: pending } })),
}));

async function accessToken() {
  if (!supabaseClient) return "";
  const { data } = await supabaseClient.auth.getSession();
  return data?.session?.access_token || "";
}

async function request(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  if (!token) throw new Error("Sign in to save places across devices.");
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Couldn't save. Try again.");
  return body;
}

export async function hydrateSavedEntities() {
  const result = await request("/api/resident/saved");
  useSavedStore.getState().hydrate(result.entities || [], result.profileId || null);
  return result;
}

export async function toggleSavedEntity(entity: SavedEntity, saved: boolean) {
  const store = useSavedStore.getState();
  const previous = store.savedIds.includes(entity.entityId);
  store.setOptimistic(entity, saved);
  store.setPending(entity.entityId, true);
  try {
    const idempotencyKey = globalThis.crypto?.randomUUID?.() || `save-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return await request("/api/resident/saved", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        entityType: entity.entityType,
        entityId: entity.entityId,
        saved,
        idempotencyKey,
        sourceSurface: "map_detail_drawer",
        sourceRoute: typeof window === "undefined" ? "" : `${window.location.pathname}${window.location.search}`,
        sourceContext: entity.metadata || {},
      }),
    });
  } catch (error) {
    store.setOptimistic(entity, previous);
    throw error;
  } finally {
    store.setPending(entity.entityId, false);
  }
}

export function useSavedEntitiesRealtime() {
  const profileId = useSavedStore((state) => state.profileId);
  useEffect(() => {
    void hydrateSavedEntities().catch(() => {});
  }, []);
  useEffect(() => {
    if (!supabaseClient || !profileId) return undefined;
    const channel = supabaseClient
      .channel(`resident-saved:${profileId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "resident_saved_entities", filter: `resident_profile_id=eq.${profileId}` }, () => {
        void hydrateSavedEntities().catch(() => {});
      })
      .subscribe();
    return () => { void supabaseClient.removeChannel(channel); };
  }, [profileId]);
}
