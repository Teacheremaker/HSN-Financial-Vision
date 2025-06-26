
'use client';
import { create } from 'zustand';

export type Scenario = {
  adoptionRate: number;
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
};

type Actions = {
  setActiveScenario: (scenario: keyof Scenarios) => void;
  updateScenarioValue: <K extends keyof Scenario>(
    scenario: keyof Scenarios,
    param: K,
    value: Scenario[K]
  ) => void;
};

const initialState: Scenarios = {
  optimistic: {
    adoptionRate: 75,
    priceIncrease: 5,
    indexationRate: 2,
  },
  conservative: {
    adoptionRate: 75,
    priceIncrease: 5,
    indexationRate: 2,
  },
  extension: {
    adoptionRate: 75,
    priceIncrease: 5,
    indexationRate: 2,
  },
};


export const useScenarioStore = create<State & Actions>((set) => ({
  scenarios: initialState,
  activeScenario: 'optimistic',
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
}));

export const initialScenarioState = initialState;
