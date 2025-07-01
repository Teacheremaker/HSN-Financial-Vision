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
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;
};

const initialAdoptionRates: AdoptionRates = useServiceStore.getState().getServiceNames().reduce((acc, name) => {
    acc[name] = 0;
    return acc;
}, {} as AdoptionRates);

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
  setStartYear: (year) => set({ startYear: year }),
  setEndYear: (year) => set({ endYear: year }),
}));
