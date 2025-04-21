import { create } from 'zustand';

interface RegistrationState {
  isNewlyRegistered: boolean;
  setNewlyRegistered: (value: boolean) => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  isNewlyRegistered: false,
  setNewlyRegistered: (value) => set({ isNewlyRegistered: value }),
}));
