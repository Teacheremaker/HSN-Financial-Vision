
import type { MultiSelectOption as MultiSelectOptionPrimitive } from "@/components/ui/multi-select";

export type KpiData = {
  name: React.ReactNode;
  value: React.ReactNode;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
};

export type ProjectionData = {
  year: number;
  optimistic: number;
  conservative: number;
  extension: number;
  cost?: number;
};

export type ServiceSubscription = {
  name: string;
  year: number;
};

export type EntityType = 'Commune' | 'Syndicat' | 'Communauté de communes' | 'Communauté d\'agglo' | 'Département' | 'Autre';

export type Entity = {
  id: string;
  nom: string;
  entityType?: EntityType;
  population: number;
  type: 'Fondatrice' | 'Utilisatrice';
  statut: 'Actif' | 'Inactif';
  services: ServiceSubscription[];
};

export type Tariff = {
  id: string;
  service: string;
  category: string;
  populationMin?: number;
  populationMax?: number;
  priceFounder?: number;
  priceUser?: number;
  discountFounder?: number; // in %
  notes?: string;
};

export type OperationalCost = {
  id: string;
  service: string;
  costItem: string;
  category: 'Fixe' | 'Variable' | 'Amortissement' | 'À amortir';
  annualCost: number;
  notes: string;
  amortizationStartYear?: number;
  amortizationDuration?: number;
};

export type MultiSelectOption = MultiSelectOptionPrimitive;

export type ServiceDefinition = {
    name: string;
    color: string;
<<<<<<< HEAD
};

    
=======
    colorClass: string;
};
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
