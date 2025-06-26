
'use client';
import { create } from 'zustand';

const SERVICES = ["GEOTER", "SPANC", "ROUTE", "ADS"];

type State = {
  selectedService: string;
};

type Actions = {
  setSelectedService: (service: string) => void;
  getServices: () => string[];
};

export const useChartFilterStore = create<State & Actions>((set) => ({
  selectedService: 'Tous les services',
  setSelectedService: (service) => set({ selectedService: service }),
  getServices: () => ['Tous les services', ...SERVICES],
}));
