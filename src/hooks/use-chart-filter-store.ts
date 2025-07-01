
'use client';
import { create } from 'zustand';
import { useServiceStore } from './use-service-store';

type State = {
  selectedService: string;
};

type Actions = {
  setSelectedService: (service: string) => void;
  getServicesForFilter: () => string[];
};

export const useChartFilterStore = create<State & Actions>((set, get) => ({
  selectedService: 'Tous les services',
  setSelectedService: (service) => set({ selectedService: service }),
  getServicesForFilter: () => {
    const serviceNames = useServiceStore.getState().getServiceNames();
    return ['Tous les services', ...serviceNames];
  },
}));
