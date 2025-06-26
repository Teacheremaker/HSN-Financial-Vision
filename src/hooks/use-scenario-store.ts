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
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;
};

const initialScenario: Scenario = {
  adoptionRates: { GEOTER: 33, SPANC: 33, ROUTE: 33, ADS: 33 },
  priceIncrease: 5,
  indexationRate: 2,
};


export const useScenarioStore = create<State & Actions>((set) => ({
  scenario: initialScenario,
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
  setStartYear: (year) => set({ startYear: year }),
  setEndYear: (year) => set({ endYear: year }),
}));

export const initialScenarioState = initialScenario;
