/**
 * Resident Intelligence Store — User behavior memory
 * Tracks: viewed, saved, redeemed
 * Used in: ranking, personalization
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useResidentStore = create(
  persist(
    (set) => ({
      // History tracking
      history: {
        viewed: [], // entityId[]
        saved: [], // entityId[]
        redeemed: [], // entityId[]
      },

      // Actions
      addViewed: (entityId) =>
        set((state) => {
          const viewed = [...new Set([entityId, ...state.history.viewed])].slice(0, 100);
          return { history: { ...state.history, viewed } };
        }),

      addSaved: (entityId) =>
        set((state) => {
          const saved = state.history.saved.includes(entityId)
            ? state.history.saved
            : [entityId, ...state.history.saved];
          return { history: { ...state.history, saved } };
        }),

      removeSaved: (entityId) =>
        set((state) => ({
          history: {
            ...state.history,
            saved: state.history.saved.filter((id) => id !== entityId),
          },
        })),

      addRedeemed: (entityId) =>
        set((state) => {
          const redeemed = [...new Set([entityId, ...state.history.redeemed])];
          return { history: { ...state.history, redeemed } };
        }),

      reset: () =>
        set({
          history: {
            viewed: [],
            saved: [],
            redeemed: [],
          },
        }),
    }),
    {
      name: 'resident-history',
    }
  )
);