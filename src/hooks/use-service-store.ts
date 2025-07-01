
'use client';

import { create } from 'zustand';
import { useScenarioStore } from './use-scenario-store';
import type { ServiceDefinition } from '@/types';

export const PALETTE_COLORS = [
    'hsl(var(--chart-1))', 
    'hsl(var(--chart-2))', 
    'hsl(var(--chart-3))', 
    'hsl(var(--chart-4))', 
    'hsl(var(--chart-5))',
    'hsl(262, 80%, 50%)', // A purple
    'hsl(330, 80%, 55%)', // A pink
    'hsl(210, 85%, 55%)', // A brighter blue
];

const initialServices: ServiceDefinition[] = [
    { name: "GEOTER", color: PALETTE_COLORS[0] },
    { name: "SPANC", color: PALETTE_COLORS[1] },
    { name: "ROUTE", color: PALETTE_COLORS[2] },
    { name: "ADS", color: PALETTE_COLORS[4] },
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

    