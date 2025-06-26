
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

export type Entity = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  services: number;
  roi: string;
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
  costItem: string;
  category: 'Fixed' | 'Variable';
  monthlyCost: number;
  notes: string;
};
