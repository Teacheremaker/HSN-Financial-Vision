
'use client';

import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, DollarSign, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { KpiData, Entity, Tariff, OperationalCost } from '@/types';
import {
  useScenarioStore,
  initialScenarioState,
  SERVICES,
  type AdoptionRates,
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
  const { scenarios, activeScenario, startYear } = useScenarioStore();
  const { selectedService } = useChartFilterStore();
  const { entities } = useEntityStore();
  const { tariffs } = useTariffStore();
  const { costs } = useCostStore();

  const dynamicKpiData = useMemo(() => {
    const operationalCosts = costs.filter((c) => c.category !== 'À amortir');

    const calculateAnnualValues = (
      scenario: any,
      serviceFilter: string,
      year: number
    ) => {
      let revenue = 0;
      let cost = 0;
      let adoptionRate = 0;
      const adoptionRates: number[] = [];

      // Revenue Calculation
      const priceIncreaseFactor = Math.pow(
        1 + scenario.priceIncrease / 100,
        year > startYear ? year - startYear : 0
      );

      entities.forEach((entity) => {
        if (entity.statut !== 'Actif') return;

        entity.services.forEach((subscription) => {
          const serviceName = subscription.name;
          if (year >= subscription.year) {
            if (
              serviceFilter === 'Tous les services' ||
              serviceFilter === serviceName
            ) {
              const price = getTariffPriceForEntity(entity, serviceName, tariffs);
              revenue += price;
            }
          }
        });
      });

      // Apply global factors
      const servicesToConsider =
        serviceFilter === 'Tous les services'
          ? SERVICES
          : [serviceFilter];
      let totalInitialAdoptionRate = 0;
      let totalCurrentAdoptionRate = 0;
      let revenueWithAdoption = 0;

      if (serviceFilter === 'Tous les services') {
        SERVICES.forEach((service) => {
          const serviceKey = service as keyof AdoptionRates;
          const initialAdoptionRate =
            initialScenarioState[activeScenario].adoptionRates[serviceKey];
          const currentAdoptionRate = scenario.adoptionRates[serviceKey];
          adoptionRates.push(currentAdoptionRate);

          const adoptionFactor =
            initialAdoptionRate > 0 ? currentAdoptionRate / initialAdoptionRate : 1;

          let serviceRevenue = 0;
          entities.forEach((entity) => {
            if (
              entity.statut !== 'Actif' &&
              year >= (entity.services.find((s) => s.name === service)?.year ?? Infinity)
            ) {
              serviceRevenue += getTariffPriceForEntity(entity, service, tariffs);
            }
          });
          revenueWithAdoption += serviceRevenue * adoptionFactor;
        });
        revenue = revenueWithAdoption;
      } else if (SERVICES.includes(serviceFilter as any)) {
        const serviceKey = serviceFilter as keyof AdoptionRates;
        const initialAdoptionRate =
          initialScenarioState[activeScenario].adoptionRates[serviceKey];
        const currentAdoptionRate = scenario.adoptionRates[serviceKey];
        adoptionRates.push(currentAdoptionRate);
        const adoptionFactor =
          initialAdoptionRate > 0 ? currentAdoptionRate / initialAdoptionRate : 1;
        revenue *= adoptionFactor;
      }

      revenue *= priceIncreaseFactor;

      // Cost Calculation
      const indexationRate = scenario.indexationRate / 100;
      const numYearsIndexed = year > startYear ? year - startYear : 0;
      const relevantCosts = operationalCosts.filter((c) => {
        if (serviceFilter === 'Tous les services') {
            return true;
        }
        return c.service === serviceFilter;
      });

      relevantCosts.forEach((c) => {
        const costInflationFactor =
          c.category === 'Fixe' || c.category === 'Variable'
            ? Math.pow(1 + indexationRate, numYearsIndexed)
            : 1;
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

      // Adoption Rate Calculation
      if (serviceFilter === 'Tous les services') {
        adoptionRate =
          adoptionRates.length > 0
            ? adoptionRates.reduce((a, b) => a + b, 0) / adoptionRates.length
            : 0;
      } else if (SERVICES.includes(serviceFilter as any)) {
        adoptionRate = scenario.adoptionRates[serviceFilter as keyof AdoptionRates] ?? 0;
      }

      return { revenue, cost, adoptionRate };
    };

    const currentValues = calculateAnnualValues(
      scenarios[activeScenario],
      selectedService,
      startYear
    );
    const initialValues = calculateAnnualValues(
      initialScenarioState[activeScenario],
      selectedService,
      startYear
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
        name: `Revenu Total${serviceName}`,
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
        name: `Coût Opérationnel${serviceName}`,
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
    scenarios,
    activeScenario,
    selectedService,
    costs,
    startYear,
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
