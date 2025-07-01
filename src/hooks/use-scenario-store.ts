'use client';
import { create } from 'zustand';

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
  removeServiceFromScenario: (serviceName: string) => void;
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;
};

// The following was causing a circular dependency by calling another store during initialization.
// It's now hardcoded to match the initial services, breaking the dependency cycle.
const initialAdoptionRates: AdoptionRates = {
  "GEOTER": 0,
  "SPANC": 0,
  "ROUTE": 0,
  "ADS": 0,
};

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
  setStartYear: (year) => set({ startYear: year }),
  setEndYear: (year) => set({ endYear: year }),
}));
