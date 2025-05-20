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

export function useCountdown(id: string) {
  const store = useCountdownStore();
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    store.getRemainingSeconds(id)
  );
  
  useEffect(() => {
    setRemainingSeconds(store.getRemainingSeconds(id));
    if (store.isActive(id)) {
      const timer = setInterval(() => {
        const seconds = store.getRemainingSeconds(id);
        setRemainingSeconds(seconds);
        if (seconds <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [id, store]);
  
  const startCountdown = useCallback(
    (durationSeconds: number) => {
      store.startCountdown(id, durationSeconds);
      setRemainingSeconds(durationSeconds);
    },
    [id, store]
  );
  
  const resetCountdown = useCallback(() => {
    store.resetCountdown(id);
    setRemainingSeconds(0);
  }, [id, store]);
  
  return {
    remainingSeconds,
    isActive: remainingSeconds > 0,
    startCountdown,
    resetCountdown,
  };
}

import { useState, useEffect, useCallback } from "react";
