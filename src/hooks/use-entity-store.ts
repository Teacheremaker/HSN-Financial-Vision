
'use client';
import { create } from 'zustand';
import type { Entity } from '@/types';
import { initialEntities } from '@/data/entities';

type State = {
  entities: Entity[];
};

type Actions = {
  setEntities: (entities: Entity[]) => void;
  updateEntity: (id: string, columnId: string, value: any) => void;
  deleteEntity: (id: string) => void;
  addEntity: (entity: Entity) => void;
};

export const useEntityStore = create<State & Actions>((set) => ({
  entities: initialEntities,
  setEntities: (entities) => set({ entities }),
  updateEntity: (id, columnId, value) => set((state) => ({
    entities: state.entities.map((row) => {
        if (row.id === id) {
            return {
                ...row,
                [columnId]: value,
            };
        }
        return row;
    })
  })),
  deleteEntity: (id) => set((state) => ({
    entities: state.entities.filter((entity) => entity.id !== id)
  })),
  addEntity: (entity) => set((state) => ({ 
    entities: [...state.entities, entity] 
  })),
}));
