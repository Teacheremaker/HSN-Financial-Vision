'use client';
import { create } from 'zustand';

export const SERVICES = ["GEOTER", "SPANC", "ROUTE", "ADS"] as const;
export type Service = typeof SERVICES[number];

export type AdoptionRates = {
  [key in Service]: number;
};

export type Scenario = {
  adoptionRates: AdoptionRates;
  priceIncrease: number;
  indexationRate: number;
};

export type Scenarios = {
  optimistic: Scenario;
  conservative: Scenario;
  extension: Scenario;
};

type State = {
  scenarios: Scenarios;
  activeScenario: keyof Scenarios;
  startYear: number;
  endYear: number;
};

type Actions = {
  setActiveScenario: (scenario: keyof Scenarios) => void;
  updateScenarioValue: <K extends keyof Omit<Scenario, 'adoptionRates'>>(
    scenario: keyof Scenarios,
    param: K,
    value: Scenario[K]
  ) => void;
  updateAdoptionRate: (
    scenario: keyof Scenarios,
    service: Service,
    value: number
  ) => void;
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;
};

const initialState: Scenarios = {
  optimistic: {
    adoptionRates: { GEOTER: 75, SPANC: 75, ROUTE: 75, ADS: 75 },
    priceIncrease: 5,
    indexationRate: 2,
  },
  conservative: {
    adoptionRates: { GEOTER: 75, SPANC: 75, ROUTE: 75, ADS: 75 },
    priceIncrease: 5,
    indexationRate: 2,
  },
  extension: {
    adoptionRates: { GEOTER: 75, SPANC: 75, ROUTE: 75, ADS: 75 },
    priceIncrease: 5,
    indexationRate: 2,
  },
};


export const useScenarioStore = create<State & Actions>((set) => ({
  scenarios: initialState,
  activeScenario: 'optimistic',
  startYear: 2025,
  endYear: 2033,
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  updateScenarioValue: (scenario, param, value) => set((state) => ({
    scenarios: {
      ...state.scenarios,
      [scenario]: {
        ...state.scenarios[scenario],
        [param]: value,
      },
    },
  })),
  updateAdoptionRate: (scenario, service, value) => set((state) => ({
    scenarios: {
      ...state.scenarios,
      [scenario]: {
        ...state.scenarios[scenario],
        adoptionRates: {
            ...state.scenarios[scenario].adoptionRates,
            [service]: value,
        }
      },
    },
  })),
  setStartYear: (year) => set({ startYear: year }),
  setEndYear: (year) => set({ endYear: year }),
}));

export const initialScenarioState = initialState;
