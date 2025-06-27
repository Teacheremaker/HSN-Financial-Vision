
'use client';
import { create } from 'zustand';

type State = {
  selectedService: string;
  viewMode: 'comparative' | 'cumulative';
};

type Actions = {
  setSelectedService: (service: string) => void;
  setViewMode: (mode: 'comparative' | 'cumulative') => void;
};

export const useProfitabilityStore = create<State & Actions>((set) => ({
  selectedService: 'Tous les services',
  viewMode: 'comparative',
  setSelectedService: (service) => set({ selectedService: service }),
  setViewMode: (mode) => set(state => ({ ...state, viewMode: mode })),
}));
