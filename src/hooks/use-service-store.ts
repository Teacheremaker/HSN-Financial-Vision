<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======

>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
'use client';

import { create } from 'zustand';
import { useScenarioStore } from './use-scenario-store';
<<<<<<< HEAD
<<<<<<< HEAD
import type { ServiceDefinition } from '@/types';
import { useTariffStore } from './use-tariff-store';
import { useCostStore } from './use-cost-store';
import { useEntityStore } from './use-entity-store';

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
=======
=======
import type { ServiceDefinition } from '@/types';
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)

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
<<<<<<< HEAD
    { name: "GEOTER", ...CHART_COLORS[0] },
    { name: "SPANC", ...CHART_COLORS[1] },
    { name: "ROUTE", ...CHART_COLORS[2] },
    { name: "ADS", ...CHART_COLORS[4] },
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
    { name: "GEOTER", color: PALETTE_COLORS[0] },
    { name: "SPANC", color: PALETTE_COLORS[1] },
    { name: "ROUTE", color: PALETTE_COLORS[2] },
    { name: "ADS", color: PALETTE_COLORS[4] },
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
];

type State = {
  services: ServiceDefinition[];
};

type Actions = {
<<<<<<< HEAD
<<<<<<< HEAD
  addService: (name: string, color: string) => void;
  deleteService: (name: string) => void;
=======
  addService: (name: string) => void;
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
  addService: (name: string, color: string) => void;
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
  getServiceNames: () => string[];
};

export const useServiceStore = create<State & Actions>((set, get) => ({
  services: initialServices,
<<<<<<< HEAD
<<<<<<< HEAD
  addService: (name, color) => {
    const newService: ServiceDefinition = { name, color };
    
    set((state) => ({ 
        services: [...state.services, newService] 
    }));
=======
  addService: (name) => {
    const currentServices = get().services;
    const nextColor = CHART_COLORS[currentServices.length % CHART_COLORS.length];
    
    const newService: ServiceDefinition = {
      name,
      ...nextColor
    };

    set({ services: [...currentServices, newService] });
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
  addService: (name, color) => {
    const newService: ServiceDefinition = { name, color };
    
    set((state) => ({ 
        services: [...state.services, newService] 
    }));
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
    
    // Also update the scenario store
    useScenarioStore.getState().addServiceToScenario(name);
  },
<<<<<<< HEAD
  deleteService: (name) => {
    // Call cleanup functions in other stores first
    useScenarioStore.getState().removeServiceFromScenario(name);
    useTariffStore.getState().deleteTariffsByService(name);
    useCostStore.getState().deleteCostsByService(name);
    useEntityStore.getState().removeServiceFromEntities(name);

    // Then, remove the service from this store
    set((state) => ({
      services: state.services.filter(service => service.name !== name),
    }));
  },
=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
  getServiceNames: () => get().services.map(s => s.name),
}));
