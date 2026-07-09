"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RSVP, RSVPFormData } from "@/lib/schemas";

interface RSVPStore {
  addRSVP: (data: RSVPFormData) => void;
  deleteRSVP: (id: string) => void;
  getRSVP: (id: string) => RSVP | undefined;
  getStats: () => {
    total: number;
    attending: number;
    notAttending: number;
    totalGuests: number;
  };
  rsvps: RSVP[];
  updateRSVP: (id: string, data: Partial<RSVPFormData>) => void;
}

export const useRSVPStore = create<RSVPStore>()(
  persist(
    (set, get) => ({
      addRSVP: (data) => {
        const newRSVP: RSVP = {
          ...data,
          createdAt: new Date().toISOString(),
          id: crypto.randomUUID(),
        };
        set((state) => ({
          rsvps: [...state.rsvps, newRSVP],
        }));
      },
      deleteRSVP: (id) => {
        set((state) => ({
          rsvps: state.rsvps.filter((rsvp) => rsvp.id !== id),
        }));
      },
      getRSVP: (id) => {
        return get().rsvps.find((rsvp) => rsvp.id === id);
      },
      getStats: () => {
        const rsvps = get().rsvps;
        return {
          attending: rsvps.filter((r) => r.attending).length,
          notAttending: rsvps.filter((r) => !r.attending).length,
          total: rsvps.length,
          totalGuests: rsvps.reduce(
            (sum, r) => sum + (r.attending ? r.guests : 0),
            0,
          ),
        };
      },
      rsvps: [],
      updateRSVP: (id, data) => {
        set((state) => ({
          rsvps: state.rsvps.map((rsvp) =>
            rsvp.id === id ? { ...rsvp, ...data } : rsvp,
          ),
        }));
      },
    }),
    {
      name: "rsvp-storage",
    },
  ),
);