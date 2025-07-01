
'use client';

import { create } from 'zustand';
import { useScenarioStore } from './use-scenario-store';
import type { ServiceDefinition } from '@/types';

export const PALETTE_COLORS = [
    // Blues
    '#0077b6', '#48cae4', '#90e0ef', '#ade8f4',
    // Greens
    '#2d6a4f', '#40916c', '#52b788', '#b7e4c7',
    // Oranges / Yellows
    '#d95f02', '#f77f00', '#fcbf49', '#eae2b7',
    // Reds
    '#ae2012', '#d00000', '#e85d04', '#ffba08',
    // Purples
    '#5a189a', '#9d4edd', '#c77dff', '#e0aaff',
    // Greys
    '#000000', '#495057', '#adb5bd', '#dee2e6',
];

const initialServices: ServiceDefinition[] = [
    { name: "GEOTER", color: "#0077b6" },
    { name: "SPANC", color: "#40916c" },
    { name: "ROUTE", color: "#fcbf49" },
    { name: "ADS", color: "#9d4edd" },
];

type State = {
  services: ServiceDefinition[];
};

type Actions = {
  addService: (name: string, color: string) => void;
  getServiceNames: () => string[];
};

export const useServiceStore = create<State & Actions>((set, get) => ({
  services: initialServices,
  addService: (name, color) => {
    const newService: ServiceDefinition = { name, color };
    
    set((state) => ({ 
        services: [...state.services, newService] 
    }));
    
    // Also update the scenario store
    useScenarioStore.getState().addServiceToScenario(name);
  },
  getServiceNames: () => get().services.map(s => s.name),
}));

    
