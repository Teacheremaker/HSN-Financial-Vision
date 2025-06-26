
'use client';
import { create } from 'zustand';
import type { Tariff } from '@/types';
import { initialTariffs } from '@/data/tariffs';

type State = {
  tariffs: Tariff[];
};

type Actions = {
  setTariffs: (tariffs: Tariff[]) => void;
  updateTariff: (id: string, field: keyof Tariff, value: any) => void;
  addTariff: (tariff: Tariff) => void;
  deleteTariff: (id: string) => void;
};

export const useTariffStore = create<State & Actions>((set) => ({
  tariffs: initialTariffs,
  setTariffs: (tariffs) => set({ tariffs }),
  updateTariff: (id, field, value) => set((state) => ({
    tariffs: state.tariffs.map(tariff =>
      tariff.id === id ? { ...tariff, [field]: value } : tariff
    ),
  })),
  addTariff: (tariff) => set((state) => ({
    tariffs: [...state.tariffs, tariff],
  })),
  deleteTariff: (id) => set((state) => ({
    tariffs: state.tariffs.filter(tariff => tariff.id !== id),
  })),
}));
