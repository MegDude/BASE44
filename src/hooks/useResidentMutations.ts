import { useCallback, useState } from "react";
import { residentMutationsRepository } from "@/lib/repositories/residentMutationsRepository";

function getResidentSessionId() {
  if (typeof window === "undefined") {
    return "resident-session-server";
  }

  const storageKey = "dp_resident_session_id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const nextId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `resident-${Date.now()}`;

  window.localStorage.setItem(storageKey, nextId);
  return nextId;
}

export function useResidentMutations(residentId?: string) {
  const effectiveResidentId = residentId || getResidentSessionId();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const run = useCallback(
    async (action: string, fn: () => Promise<any>) => {
      setPendingAction(action);
      try {
        const result = await fn();
        setLastResult({ action, result, ok: result?.success !== false });
        return result;
      } finally {
        setPendingAction(null);
      }
    },
    []
  );

  return {
    pendingAction,
    lastResult,
    toggleSavedItem: (item: any) =>
      run("save", () => residentMutationsRepository.toggleSavedItem({ residentId: effectiveResidentId, item })),
    upsertRsvp: (item: any, status = "going") =>
      run("rsvp", () => residentMutationsRepository.upsertRsvp({ residentId: effectiveResidentId, item, status })),
    createRedemption: (item: any) =>
      run("redeem", () => residentMutationsRepository.createRedemption({ residentId: effectiveResidentId, item })),
    logInteraction: (item: any, action: string, query?: string, metadata = {}) =>
      residentMutationsRepository.logInteraction({ residentId: effectiveResidentId, item, action, query, metadata }),
  };
}
