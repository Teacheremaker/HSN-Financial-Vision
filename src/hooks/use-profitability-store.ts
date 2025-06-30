
'use client';
import { create } from 'zustand';

type State = {
  selectedService: string;
};

type Actions = {
  setSelectedService: (service: string) => void;
};

export const useProfitabilityStore = create<State & Actions>((set) => ({
  selectedService: 'Tous les services',
  setSelectedService: (service) => set({ selectedService: service }),
}));
