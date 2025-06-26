
export type KpiData = {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
};

export type ProjectionData = {
  year: number;
  optimistic: number;
  conservative: number;
  extension: number;
};

export type ServiceSubscription = {
  name: string;
  year: number;
};

export type Entity = {
  id: string;
  nom: string;
  population: number;
  type: 'Fondatrice' | 'Utilisatrice';
  statut: 'Actif' | 'Inactif';
  services: ServiceSubscription[];
};

export type Tariff = {
  id: string;
  service: string;
  category: string;
  unit: string;
  price: number;
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

export type Adherent = {
  id: string;
  name: string;
  population: number;
  status: 'Fondatrice' | 'Utilisatrice';
  adhesionDate: string;
  services: string[];
};
