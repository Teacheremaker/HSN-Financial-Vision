
'use client';

import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, DollarSign, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { KpiData } from '@/types';
import {
  useScenarioStore,
  initialScenarioState,
  SERVICES,
  type AdoptionRates,
  type Scenario,
  type Service,
} from '@/hooks/use-scenario-store';
import { useChartFilterStore } from '@/hooks/use-chart-filter-store';
import { useEntityStore } from '@/hooks/use-entity-store';
import { useTariffStore } from '@/hooks/use-tariff-store';
import { useCostStore } from '@/hooks/use-cost-store';
import { getTariffPriceForEntity } from '@/lib/projections';

const KpiCard = ({ kpi }: { kpi: KpiData }) => {
  const isGoodChange = kpi.changeType === 'increase';
  const ChangeIcon = isGoodChange ? ArrowUpRight : ArrowDownRight;
  const changeColor = isGoodChange
    ? 'text-green-600 dark:text-green-500'
    : 'text-red-600 dark:text-red-500';

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
  const { scenario, startYear, endYear } = useScenarioStore();
  const { selectedService } = useChartFilterStore();
  const { entities } = useEntityStore();
  const { tariffs } = useTariffStore();
  const { costs } = useCostStore();

  const dynamicKpiData = useMemo(() => {
    const operationalCosts = costs.filter((c) => c.category !== 'À amortir');

    const calculateAnnualValues = (
      scenario: Scenario,
      serviceFilter: string,
      year: number
    ) => {
      let revenue = 0;
      let cost = 0;
      const adoptionRatesForAvg: number[] = [];

      // --- Revenue ---
      const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
      const servicesForRevenue = serviceFilter === 'Tous les services' ? SERVICES : (SERVICES.includes(serviceFilter as any) ? [serviceFilter as Service] : []);

      servicesForRevenue.forEach(service => {
        let baseRevenue = 0;
        let potentialRevenue = 0;

        entities.forEach(entity => {
          if (entity.statut !== 'Actif') return;
          const price = getTariffPriceForEntity(entity, service, tariffs);
          const subscription = entity.services.find(s => s.name === service);

          if (subscription && year >= subscription.year) {
            baseRevenue += price;
          } else if (!subscription) {
            potentialRevenue += price;
          }
        });

        const serviceKey = service as keyof AdoptionRates;
        const adoptionRatePercent = scenario.adoptionRates[serviceKey];
        const additionalRevenue = potentialRevenue * (adoptionRatePercent / 100);

        revenue += baseRevenue + additionalRevenue;
        
        adoptionRatesForAvg.push(adoptionRatePercent);
      });

      revenue *= priceIncreaseFactor;

      // --- Cost ---
      const indexationRate = scenario.indexationRate / 100;
      const numYearsIndexed = year > startYear ? year - startYear : 0;
      
      const relevantCosts = operationalCosts.filter((c) => {
        if (serviceFilter === 'Tous les services') {
            return true;
        }
        // For a specific service, include ONLY its direct costs.
        return c.service === serviceFilter;
      });

      relevantCosts.forEach((c) => {
        const costInflationFactor = (c.category === 'Fixe' || c.category === 'Variable') ? Math.pow(1 + indexationRate, numYearsIndexed) : 1;
        
        if (c.category === 'Amortissement') {
            const start = c.amortizationStartYear ?? 0;
            const duration = c.amortizationDuration ?? 0;
            if (duration > 0 && year >= start && year < start + duration) {
                cost += c.annualCost;
            }
        } else {
            cost += c.annualCost * costInflationFactor;
        }
      });

      // --- Adoption Rate ---
      let adoptionRate = 0;
      if (serviceFilter === 'Tous les services') {
        adoptionRate = adoptionRatesForAvg.length > 0 ? adoptionRatesForAvg.reduce((a, b) => a + b, 0) / adoptionRatesForAvg.length : 0;
      } else if (SERVICES.includes(serviceFilter as any)) {
        adoptionRate = scenario.adoptionRates[serviceFilter as keyof AdoptionRates] ?? 0;
      }

      return { revenue, cost, adoptionRate };
    };

    const currentValues = calculateAnnualValues(
      scenario,
      selectedService,
      endYear
    );
    const initialValues = calculateAnnualValues(
      initialScenarioState,
      selectedService,
      endYear
    );

    const revenueChange =
      initialValues.revenue > 0
        ? (currentValues.revenue / initialValues.revenue - 1) * 100
        : currentValues.revenue > 0
        ? 100
        : 0;
    const costChange =
      initialValues.cost > 0
        ? (currentValues.cost / initialValues.cost - 1) * 100
        : currentValues.cost > 0
        ? 100
        : 0;
    const adoptionChange =
      initialValues.adoptionRate > 0
        ? (currentValues.adoptionRate / initialValues.adoptionRate - 1) * 100
        : currentValues.adoptionRate > 0
        ? 100
        : 0;

    const formatChange = (val: number) =>
      `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

    const serviceName =
      selectedService === 'Tous les services' ? '' : ` ${selectedService}`;
    const adoptionTitle =
      selectedService === 'Tous les services'
        ? "Taux d'Adoption (Moy.)"
        : `Taux d'Adoption ${selectedService}`;

    const kpis = [
      {
        name: `Revenu Total${serviceName} (${endYear})`,
        value: `€${currentValues.revenue.toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        change: formatChange(revenueChange),
        changeType:
          currentValues.revenue >= initialValues.revenue ? 'increase' : 'decrease',
        icon: DollarSign,
      },
      {
        name: adoptionTitle,
        value: `${currentValues.adoptionRate.toFixed(0)}%`,
        change: formatChange(adoptionChange),
        changeType:
          currentValues.adoptionRate >= initialValues.adoptionRate
            ? 'increase'
            : 'decrease',
        icon: Users,
      },
      {
        name: `Coût Opérationnel${serviceName} (${endYear})`,
        value: `€${currentValues.cost.toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        change: formatChange(costChange),
        changeType: currentValues.cost <= initialValues.cost ? 'increase' : 'decrease', // Lower cost is good
        icon: ArrowDownRight,
      },
    ] as KpiData[];

    return kpis;
  }, [
    scenario,
    selectedService,
    costs,
    startYear,
    endYear,
    entities,
    tariffs,
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dynamicKpiData.map((kpi) => (
        <KpiCard key={kpi.name} kpi={kpi} />
      ))}
    </div>
  );
}
