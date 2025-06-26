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
          {kpi.change}
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
        revenue += (baseRevenue + potentialRevenue * (adoptionRatePercent / 100));
      });
      revenue *= priceIncreaseFactor;

      // --- Cost ---
      const indexationRate = scenario.indexationRate / 100;
      const numYearsIndexed = year > startYear ? year - startYear : 0;
      
      const relevantCosts = operationalCosts.filter((c) => {
        if (serviceFilter === 'Tous les services') return true;
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

      return { revenue, cost };
    };
    
    const calculateSubscriptionRate = (year: number, serviceFilter: string): number => {
        const totalEntities = entities.length;
        if (totalEntities === 0) return 0;

        let subscribedEntitiesCount = 0;
        if (serviceFilter === 'Tous les services') {
            subscribedEntitiesCount = entities.filter(e => e.services.some(s => s.year <= year)).length;
        } else {
            subscribedEntitiesCount = entities.filter(e => e.services.some(s => s.name === serviceFilter && s.year <= year)).length;
        }

        return (subscribedEntitiesCount / totalEntities) * 100;
    };


    const currentValuesForEnd = calculateAnnualValues(
      scenario,
      selectedService,
      endYear
    );
    const initialValuesForStart = calculateAnnualValues(
      initialScenarioState,
      selectedService,
      startYear
    );

    const currentValuesForStart = calculateAnnualValues(
        scenario,
        selectedService,
        startYear
    );
    
    // Revenue Change
    const revenueChange =
      initialValuesForStart.revenue > 0
        ? (currentValuesForEnd.revenue / initialValuesForStart.revenue - 1) * 100
        : currentValuesForEnd.revenue > 0
        ? 100
        : 0;
    const revenueChangeText = `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% depuis le scénario initial`;

    const costChange =
      initialValuesForStart.cost > 0
        ? (currentValuesForStart.cost / initialValuesForStart.cost - 1) * 100
        : currentValuesForStart.cost > 0
        ? 100
        : 0;
    const costChangeText = `${costChange >= 0 ? '+' : ''}${costChange.toFixed(1)}% depuis le scénario initial`;

    const currentSubscriptionRate = calculateSubscriptionRate(endYear, selectedService);
    const initialSubscriptionRate = calculateSubscriptionRate(startYear, selectedService);
    const subscriptionChange = currentSubscriptionRate - initialSubscriptionRate;
    const subscriptionChangeText = `${subscriptionChange >= 0 ? '+' : ''}${subscriptionChange.toFixed(1)} pts depuis ${startYear}`;


    const serviceName =
      selectedService === 'Tous les services' ? '' : ` ${selectedService}`;
    const adoptionTitle =
      selectedService === 'Tous les services'
        ? "Taux d'Adoption (Global)"
        : `Taux d'Adoption ${selectedService}`;

    const kpis = [
      {
        name: `Revenu Total${serviceName} (${endYear})`,
        value: `€${currentValuesForEnd.revenue.toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        change: revenueChangeText,
        changeType: 'increase',
        icon: DollarSign,
      },
      {
        name: adoptionTitle,
        value: `${currentSubscriptionRate.toFixed(0)}%`,
        change: subscriptionChangeText,
        changeType:
          subscriptionChange >= 0
            ? 'increase'
            : 'decrease',
        icon: Users,
      },
      {
        name: `Coût Opérationnel${serviceName} (${startYear})`,
        value: `€${currentValuesForStart.cost.toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        change: costChangeText,
        changeType: currentValuesForStart.cost <= initialValuesForStart.cost ? 'increase' : 'decrease', // Lower cost is good
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
