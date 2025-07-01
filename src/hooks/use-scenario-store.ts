'use client';
import { create } from 'zustand';
import { useServiceStore } from './use-service-store';

export type Service = string;

export type AdoptionRates = Record<string, number>;

export type Scenario = {
  adoptionRates: AdoptionRates;
  priceIncrease: number;
  indexationRate: number;
};

type State = {
  scenario: Scenario;
  startYear: number;
  endYear: number;
};

type Actions = {
  updateScenarioValue: <K extends keyof Omit<Scenario, 'adoptionRates'>>(
    param: K,
    value: Scenario[K]
  ) => void;
  updateAdoptionRate: (
    service: Service,
    value: number
  ) => void;
  addServiceToScenario: (serviceName: string) => void;
<<<<<<< HEAD
  removeServiceFromScenario: (serviceName: string) => void;
=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;
};

<<<<<<< HEAD
// The following was causing a circular dependency by calling another store during initialization.
// It's now hardcoded to match the initial services, breaking the dependency cycle.
const initialAdoptionRates: AdoptionRates = {
  "GEOTER": 0,
  "SPANC": 0,
  "ROUTE": 0,
  "ADS": 0,
};
=======
const initialAdoptionRates: AdoptionRates = useServiceStore.getState().getServiceNames().reduce((acc, name) => {
    acc[name] = 0;
    return acc;
}, {} as AdoptionRates);
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)

export const initialScenarioState: Scenario = {
  adoptionRates: initialAdoptionRates,
  priceIncrease: 0,
  indexationRate: 1,
};


export const useScenarioStore = create<State & Actions>((set) => ({
  scenario: initialScenarioState,
  startYear: 2025,
  endYear: 2033,
  updateScenarioValue: (param, value) => set((state) => ({
    scenario: {
      ...state.scenario,
      [param]: value,
    },
  })),
  updateAdoptionRate: (service, value) => set((state) => ({
    scenario: {
      ...state.scenario,
      adoptionRates: {
          ...state.scenario.adoptionRates,
          [service]: value,
      }
    },
  })),
  addServiceToScenario: (serviceName: string) => set((state) => ({
    scenario: {
      ...state.scenario,
      adoptionRates: {
        ...state.scenario.adoptionRates,
        [serviceName]: 0, // Initialize new service with 0% adoption
      }
    }
  })),
<<<<<<< HEAD
  removeServiceFromScenario: (serviceName: string) => set((state) => {
    const newAdoptionRates = { ...state.scenario.adoptionRates };
    delete newAdoptionRates[serviceName];
    return {
      scenario: {
        ...state.scenario,
        adoptionRates: newAdoptionRates,
      }
    };
  }),
=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
  setStartYear: (year) => set({ startYear: year }),
  setEndYear: (year) => set({ endYear: year }),
}));
