
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
  // A 'good' change is an 'increase' in performance. For costs, lower is better.
  const isIncrease = kpi.name === "Coût Opérationnel" ? kpi.changeType === 'decrease' : kpi.changeType === 'increase';
  const ChangeIcon = isIncrease ? ArrowUpRight : ArrowDownRight;
  const changeColor = isIncrease ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

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
        // We use optimistic as baseline, but all initial scenarios are the same
        const initialScenario = initialScenarioState.optimistic;

        // Base values from original static data
        const baseRevenue = 45231.89;
        const baseAdoption = 75;
        const baseRoi = 15.3;
        const baseCost = 8750.00;

        // Calculate factors based on scenario changes.
        // We assume a single period for these KPI cards for simplicity.
        const adoptionFactor = currentScenario.adoptionRate / initialScenario.adoptionRate;
        const priceFactor = (1 + currentScenario.priceIncrease / 100) / (1 + initialScenario.priceIncrease / 100);
        const indexationFactor = (1 + currentScenario.indexationRate / 100) / (1 + initialScenario.indexationRate / 100);

        // Calculate new values
        const newRevenue = baseRevenue * adoptionFactor * priceFactor;
        const newAdoption = currentScenario.adoptionRate;
        const newCost = baseCost * indexationFactor;
        const newRoi = baseRoi * (newRevenue / baseRevenue) / (newCost / baseCost);

        const revenueChange = ((newRevenue / baseRevenue) - 1) * 100;
        const adoptionChange = ((newAdoption / baseAdoption) - 1) * 100;
        const costChange = ((newCost / baseCost) - 1) * 100;
        const roiChange = ((newRoi / baseRoi) - 1) * 100;
        
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
                name: "Taux d'Adoption",
                value: `${newAdoption.toFixed(0)}%`,
                change: formatChange(adoptionChange),
                changeType: newAdoption >= baseAdoption ? 'increase' : 'decrease',
                icon: Users,
            },
            {
                name: "ROI Projeté",
                value: `${newRoi.toFixed(1)}%`,
                change: formatChange(roiChange),
                changeType: newRoi >= baseRoi ? 'increase' : 'decrease',
                icon: TrendingUp,
            },
            {
                name: "Coût Opérationnel",
                value: `€${newCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: formatChange(costChange),
                changeType: newCost <= baseCost ? 'increase' : 'decrease',
                icon: ArrowDownRight, // Original static icon
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
