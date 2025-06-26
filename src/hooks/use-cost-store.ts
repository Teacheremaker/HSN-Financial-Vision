
'use client';
import { create } from 'zustand';
import type { OperationalCost } from '@/types';
import { initialCosts } from '@/data/costs';

type State = {
  costs: OperationalCost[];
};

type Actions = {
  setCosts: (costs: OperationalCost[]) => void;
  updateCost: (id: string, field: keyof OperationalCost, value: any) => void;
  addCost: (cost: OperationalCost) => void;
  deleteCost: (id: string) => void;
};

export const useCostStore = create<State & Actions>((set) => ({
  costs: initialCosts,
  setCosts: (costs) => set({ costs }),
  updateCost: (id, field, value) => set((state) => ({
    costs: state.costs.map(cost =>
      cost.id === id ? { ...cost, [field]: value } : cost
    ),
  })),
  addCost: (cost) => set((state) => ({
    costs: [...state.costs, cost],
  })),
  deleteCost: (id) => set((state) => ({
    costs: state.costs.filter(cost => cost.id !== id),
  })),
}));
