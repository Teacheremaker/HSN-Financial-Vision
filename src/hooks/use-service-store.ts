'use client';

import { create } from 'zustand';
import { useScenarioStore } from './use-scenario-store';

export type ServiceDefinition = {
  name: string;
  color: string;
  colorClass: string;
};

const CHART_COLORS = [
    { color: 'hsl(var(--chart-1))', colorClass: 'text-chart-1' },
    { color: 'hsl(var(--chart-2))', colorClass: 'text-chart-2' },
    { color: 'hsl(var(--chart-3))', colorClass: 'text-chart-3' },
    { color: 'hsl(var(--chart-4))', colorClass: 'text-chart-4' },
    { color: 'hsl(var(--chart-5))', colorClass: 'text-chart-5' },
];

const initialServices: ServiceDefinition[] = [
    { name: "GEOTER", ...CHART_COLORS[0] },
    { name: "SPANC", ...CHART_COLORS[1] },
    { name: "ROUTE", ...CHART_COLORS[2] },
    { name: "ADS", ...CHART_COLORS[4] },
];

type State = {
  services: ServiceDefinition[];
};

type Actions = {
  addService: (name: string) => void;
  getServiceNames: () => string[];
};

export const useServiceStore = create<State & Actions>((set, get) => ({
  services: initialServices,
  addService: (name) => {
    const currentServices = get().services;
    const nextColor = CHART_COLORS[currentServices.length % CHART_COLORS.length];
    
    const newService: ServiceDefinition = {
      name,
      ...nextColor
    };

    set({ services: [...currentServices, newService] });
    
    // Also update the scenario store
    useScenarioStore.getState().addServiceToScenario(name);
  },
  getServiceNames: () => get().services.map(s => s.name),
}));
