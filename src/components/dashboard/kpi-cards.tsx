'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Euro,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { KpiData } from '@/types';
import {
  useScenarioStore,
  initialScenarioState,
  type AdoptionRates,
  type Scenario,
  type Service,
} from '@/hooks/use-scenario-store';
import { useChartFilterStore } from '@/hooks/use-chart-filter-store';
import { useServiceStore } from '@/hooks/use-service-store';
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
          {kpi.change}
        </p>
      </CardContent>
    </Card>
  );
};

export function KpiCards() {
  const { scenario, startYear, endYear } = useScenarioStore();
  const { selectedService } = useChartFilterStore();
  const { getServiceNames } = useServiceStore();
  const { entities } = useEntityStore();
  const { tariffs } = useTariffStore();
  const { costs } = useCostStore();
  const [revenueYear, setRevenueYear] = useState(startYear);
  const [costYear, setCostYear] = useState(startYear);

  const SERVICES = getServiceNames();

  useEffect(() => {
    if (revenueYear < startYear || revenueYear > endYear) {
      setRevenueYear(startYear);
    }
  }, [revenueYear, startYear, endYear]);

  useEffect(() => {
    if (costYear < startYear || costYear > endYear) {
      setCostYear(startYear);
    }
  }, [costYear, startYear, endYear]);

  const dynamicKpiData = useMemo(() => {
    const operationalCosts = costs.filter((c) => c.category !== 'À amortir');

    const calculateAnnualValues = (
      scenario: Scenario,
      serviceFilter: string,
      year: number
    ) => {
      let revenue = 0;
      let cost = 0;

      // --- Revenue ---
      const priceIncreaseFactor = Math.pow(
        1 + scenario.priceIncrease / 100,
        year > startYear ? year - startYear : 0
      );
      const servicesForRevenue =
        serviceFilter === 'Tous les services'
          ? SERVICES
          : SERVICES.includes(serviceFilter as any)
          ? [serviceFilter as Service]
          : [];

      let totalBaseRevenue = 0;
      let totalAdoptionRevenue = 0;

      servicesForRevenue.forEach((service) => {
        let serviceBaseRevenue = 0;
        let servicePotentialRevenue = 0;

        // Base revenue from active entities
        entities
          .filter((e) => e.statut === 'Actif')
          .forEach((entity) => {
            const subscription = entity.services.find((s) => s.name === service);
            if (subscription && year >= subscription.year) {
              const price = getTariffPriceForEntity(entity, service, tariffs);
              serviceBaseRevenue += price;
            }
          });

        // Potential revenue from inactive entities
        entities
          .filter((e) => e.statut === 'Inactif')
          .forEach((entity) => {
            const subscription = entity.services.find(
              (s) => s.name === service
            );
            if (!subscription) {
              const price = getTariffPriceForEntity(entity, service, tariffs);
              servicePotentialRevenue += price;
            }
          });
        
        totalBaseRevenue += serviceBaseRevenue;
        const serviceKey = service as keyof AdoptionRates;
        const adoptionRatePercent = scenario.adoptionRates[serviceKey] ?? 0;
        totalAdoptionRevenue += servicePotentialRevenue * (adoptionRatePercent / 100);
      });

      const finalBaseRevenue = totalBaseRevenue * priceIncreaseFactor;
      const finalAdoptionRevenue = totalAdoptionRevenue * priceIncreaseFactor;
      revenue = finalBaseRevenue + finalAdoptionRevenue;

      // --- Cost ---
      const indexationRate = scenario.indexationRate / 100;
      const numYearsIndexed = year > startYear ? year - startYear : 0;
      const indexationFactor = Math.pow(1 + indexationRate, numYearsIndexed);

      const costsForService = operationalCosts.filter((c) => {
        if (serviceFilter === 'Tous les services') return true;
        return c.service === serviceFilter;
      });

      const projectedCosts = costsForService.map((c) => {
        let displayedAnnualCost = c.annualCost;

        if (c.category === 'Fixe' || c.category === 'Variable') {
          displayedAnnualCost *= indexationFactor;
        }

        if (c.category === 'Amortissement') {
          const start = c.amortizationStartYear ?? 0;
          const duration = c.amortizationDuration ?? 0;
          if (duration === 0 || year < start || year >= start + duration) {
            displayedAnnualCost = 0;
          }
        }

        return { displayedAnnualCost };
      });

      cost = projectedCosts.reduce(
        (sum, c) => sum + (c.displayedAnnualCost || 0),
        0
      );

      return { revenue, baseRevenue: finalBaseRevenue, adoptionRevenue: finalAdoptionRevenue, cost };
    };

    const calculateSubscriptionRate = (
      year: number,
      serviceFilter: string,
      scenario: Scenario
    ): number => {
      const totalEntities = entities.length;
      if (totalEntities === 0) return 0;

      // 1. Get base subscribers (the "socle")
      // These are unique entities that will have at least one required service by the target year
      const baseSubscribedEntityIds = new Set<string>();
      entities.forEach((entity) => {
        if (
          entity.services.some(
            (s) =>
              s.year <= year &&
              (serviceFilter === 'Tous les services' || s.name === serviceFilter)
          )
        ) {
          baseSubscribedEntityIds.add(entity.id);
        }
      });

      // 2. Calculate projected new subscribers from inactive entities
      const potentialSubscribers = entities.filter((e) => e.statut === 'Inactif');
      const projectedSubscribedEntityIds = new Set<string>();

      const servicesForAdoption =
        serviceFilter === 'Tous les services'
          ? SERVICES
          : [serviceFilter as Service];

      servicesForAdoption.forEach((service) => {
        const adoptionRate =
          (scenario.adoptionRates[service as keyof AdoptionRates] ?? 0) / 100;
        
        // Find entities from the potential pool that don't have this specific service yet
        const potentialForService = potentialSubscribers.filter(
          (e) => !e.services.some((s) => s.name === service)
        );
        
        const numToAdopt = Math.round(potentialForService.length * adoptionRate);

        // Add a portion of these potential entities to the projected set
        for (let i = 0; i < numToAdopt; i++) {
          if (potentialForService[i]) {
            projectedSubscribedEntityIds.add(potentialForService[i].id);
          }
        }
      });
      
      // 3. Combine base and projected subscribers for a final unique count
      const finalSubscribedIds = new Set([
        ...baseSubscribedEntityIds,
        ...projectedSubscribedEntityIds,
      ]);

      return (finalSubscribedIds.size / totalEntities) * 100;
    };

    const currentValuesForRevenueYear = calculateAnnualValues(
      scenario,
      selectedService,
      revenueYear
    );
    const currentValuesForCostYear = calculateAnnualValues(
      scenario,
      selectedService,
      costYear
    );
    const initialValuesForStart = calculateAnnualValues(
      initialScenarioState,
      selectedService,
      startYear
    );
    
    // Revenue Change
    const revenueChange =
      initialValuesForStart.revenue > 0
        ? (currentValuesForRevenueYear.revenue / initialValuesForStart.revenue - 1) * 100
        : currentValuesForRevenueYear.revenue > 0
        ? 100
        : 0;

    const revenueChangeText = `${
      revenueChange >= 0 ? '+' : ''
    }${revenueChange.toFixed(1)}% depuis le scénario initial`;

    // Cost Change
    const costChange =
      initialValuesForStart.cost > 0
        ? (currentValuesForCostYear.cost / initialValuesForStart.cost - 1) * 100
        : currentValuesForCostYear.cost > 0
        ? 100
        : 0;
    const costChangeText = `${costChange >= 0 ? '+' : ''}${costChange.toFixed(
      1
    )}% depuis le scénario initial`;

    const currentSubscriptionRate = calculateSubscriptionRate(
      endYear,
      selectedService,
      scenario
    );
    const initialSubscriptionRate = calculateSubscriptionRate(
      startYear,
      selectedService,
      initialScenarioState
    );
    const subscriptionChange = currentSubscriptionRate - initialSubscriptionRate;
    const subscriptionChangeText = `${
      subscriptionChange >= 0 ? '+' : ''
    }${subscriptionChange.toFixed(1)} pts depuis ${startYear}`;

    const serviceName =
      selectedService === 'Tous les services' ? '' : ` ${selectedService}`;
    const adoptionTitle =
      selectedService === 'Tous les services'
        ? "Taux d'adoption (global)"
        : `Taux d'adoption ${selectedService}`;

    const revenueKpiName = (
      <div className="flex w-full items-center justify-between">
        <span>
          Revenu total{serviceName} ({revenueYear})
        </span>
        <div className="-mr-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setRevenueYear((y) => Math.max(startYear, y - 1));
            }}
            disabled={revenueYear <= startYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setRevenueYear((y) => Math.min(endYear, y + 1));
            }}
            disabled={revenueYear >= endYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
    
    const costKpiName = (
      <div className="flex w-full items-center justify-between">
        <span>
          Coût opérationnel{serviceName} ({costYear})
        </span>
        <div className="-mr-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setCostYear((y) => Math.max(startYear, y - 1));
            }}
            disabled={costYear <= startYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setCostYear((y) => Math.min(endYear, y + 1));
            }}
            disabled={costYear >= endYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );

    const kpis: KpiData[] = [
      {
        name: revenueKpiName,
        value: (
          <div className="flex items-baseline gap-2">
            <span>
              €{(currentValuesForRevenueYear.revenue).toLocaleString('fr-FR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
            {currentValuesForRevenueYear.adoptionRevenue > 1 && (
              <span className="text-sm font-medium text-green-600 dark:text-green-500">
                (+€{currentValuesForRevenueYear.adoptionRevenue.toLocaleString('fr-FR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })})
              </span>
            )}
          </div>
        ),
        change: revenueChangeText,
        changeType: revenueChange >= 0 ? 'increase' : 'decrease',
        icon: Euro,
      },
      {
        name: adoptionTitle,
        value: `${currentSubscriptionRate.toFixed(0)}%`,
        change: subscriptionChangeText,
        changeType: subscriptionChange >= 0 ? 'increase' : 'decrease',
        icon: Users,
      },
      {
        name: costKpiName,
        value: `€${currentValuesForCostYear.cost.toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        change: costChangeText,
        changeType:
          currentValuesForCostYear.cost <= initialValuesForStart.cost
            ? 'increase'
            : 'decrease', // Lower cost is good
        icon: ArrowDownRight,
      },
    ];

    return kpis;
  }, [
    scenario,
    selectedService,
    costs,
    startYear,
    endYear,
    entities,
    tariffs,
    revenueYear,
    costYear,
    SERVICES
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dynamicKpiData.map((kpi, index) => (
        <KpiCard key={index} kpi={kpi} />
      ))}
    </div>
  );
}
