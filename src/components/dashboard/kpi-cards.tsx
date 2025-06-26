
"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, DollarSign, Users, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { KpiData } from "@/types";
import { useScenarioStore, initialScenarioState } from "@/hooks/use-scenario-store";

const KpiCard = ({ kpi }: { kpi: KpiData }) => {
  // A "good" change is an "increase" in performance.
  // For costs, a lower value is better, so its performance "increases" when the value decreases.
  const isGoodChange = kpi.changeType === 'increase';
  const ChangeIcon = isGoodChange ? ArrowUpRight : ArrowDownRight;
  const changeColor = isGoodChange ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
        <kpi.icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{kpi.value}</div>
        <p className={`text-xs ${changeColor} flex items-center`}>
          <ChangeIcon className="h-3 w-3 mr-1" />
          {kpi.change} depuis le scénario initial
        </p>
      </CardContent>
    </Card>
  );
};


export function KpiCards() {
    const { scenarios, activeScenario } = useScenarioStore();

    const dynamicKpiData = useMemo(() => {
        const currentScenario = scenarios[activeScenario];
        const initialScenario = initialScenarioState[activeScenario];

        // --- Adoption Rate Calculation ---
        const currentAdoptionRates = Object.values(currentScenario.adoptionRates);
        const newAdoption = currentAdoptionRates.reduce((a, b) => a + b, 0) / currentAdoptionRates.length;

        const initialAdoptionRates = Object.values(initialScenario.adoptionRates);
        const baseAdoption = initialAdoptionRates.reduce((a, b) => a + b, 0) / initialAdoptionRates.length;
        
        const adoptionFactor = baseAdoption > 0 ? newAdoption / baseAdoption : 1;
        
        // --- Other factors ---
        const priceFactor = (1 + currentScenario.priceIncrease / 100) / (1 + initialScenario.priceIncrease / 100);
        const indexationFactor = (1 + currentScenario.indexationRate / 100) / (1 + initialScenario.indexationRate / 100);

        // --- Base values ---
        const baseRevenue = 45231.89;
        const baseCost = 8750.00;

        // Calculate new values
        const newRevenue = baseRevenue * adoptionFactor * priceFactor;
        const newCost = baseCost * indexationFactor;
        const newRoi = baseCost > 0 ? (newRevenue - newCost) / newCost * 100 : 0;
        const baseRoiValue = baseCost > 0 ? (baseRevenue - baseCost) / baseCost * 100 : 0;

        const revenueChange = ((newRevenue / baseRevenue) - 1) * 100;
        const adoptionChange = ((newAdoption / baseAdoption) - 1) * 100;
        const costChange = ((newCost / baseCost) - 1) * 100;
        const roiChange = baseRoiValue > 0 ? ((newRoi / baseRoiValue) - 1) * 100 : (newRoi > 0 ? Infinity : 0);
        
        const formatChange = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

        return [
            {
                name: "Revenu Total",
                value: `€${newRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: formatChange(revenueChange),
                changeType: newRevenue >= baseRevenue ? 'increase' : 'decrease',
                icon: DollarSign,
            },
            {
                name: "Taux d'Adoption (Moy.)",
                value: `${newAdoption.toFixed(0)}%`,
                change: formatChange(adoptionChange),
                changeType: newAdoption >= baseAdoption ? 'increase' : 'decrease',
                icon: Users,
            },
            {
                name: "ROI Projeté",
                value: `${newRoi.toFixed(1)}%`,
                change: formatChange(roiChange),
                changeType: newRoi >= baseRoiValue ? 'increase' : 'decrease',
                icon: TrendingUp,
            },
            {
                name: "Coût Opérationnel",
                value: `€${newCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: formatChange(costChange),
                changeType: newCost <= baseCost ? 'increase' : 'decrease',
                icon: ArrowDownRight,
            },
        ] as KpiData[];

    }, [scenarios, activeScenario]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dynamicKpiData.map((kpi) => (
                <KpiCard key={kpi.name} kpi={kpi} />
            ))}
        </div>
    )
}
