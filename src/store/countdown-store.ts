import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CountdownState {
  countdowns: Record<string, number>;
  startCountdown: (id: string, durationSeconds: number) => void;
  getRemainingSeconds: (id: string) => number;
  isActive: (id: string) => boolean;
  resetCountdown: (id: string) => void;
}

export const useCountdownStore = create<CountdownState>()(
  persist(
    (set, get) => ({
      countdowns: {},

      startCountdown: (id: string, durationSeconds: number) => {
        const endTime = Date.now() + durationSeconds * 1000;
        set((state) => ({
          countdowns: {
            ...state.countdowns,
            [id]: endTime,
          },
        }));
      },

      getRemainingSeconds: (id: string) => {
        const state = get();
        const endTime = state.countdowns[id];

        if (!endTime) return 0;

        const remainingMs = endTime - Date.now();
        return Math.max(0, Math.floor(remainingMs / 1000));
      },

      isActive: (id: string) => {
        return get().getRemainingSeconds(id) > 0;
      },

      resetCountdown: (id: string) => {
        set((state) => {
          const { [id]: _, ...rest } = state.countdowns;
          return { countdowns: rest };
        });
      },
    }),
    {
      name: "kater-countdowns",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }

        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

import { useState, useEffect, useCallback } from "react";

export function useCountdown(id: string, user?: { hashid: string }) {
  const actualId = user ? `${user.hashid}-${id}` : id;

  const store = useCountdownStore();
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    store.getRemainingSeconds(actualId)
  );

  useEffect(() => {
    setRemainingSeconds(store.getRemainingSeconds(actualId));
    if (store.isActive(actualId)) {
      const timer = setInterval(() => {
        const seconds = store.getRemainingSeconds(actualId);
        setRemainingSeconds(seconds);
        if (seconds <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [actualId, store]);

  const startCountdown = useCallback(
    (durationSeconds: number) => {
      store.startCountdown(actualId, durationSeconds);
      setRemainingSeconds(durationSeconds);
    },
    [actualId, store]
  );

  const resetCountdown = useCallback(() => {
    store.resetCountdown(actualId);
    setRemainingSeconds(0);
  }, [actualId, store]);

  return {
    remainingSeconds,
    isActive: remainingSeconds > 0,
    startCountdown,
    resetCountdown,
  };
}
