"use client"

import { useMemo } from "react";
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { useScenarioStore, SERVICES, type AdoptionRates, type Service } from "@/hooks/use-scenario-store";
import { useChartFilterStore } from "@/hooks/use-chart-filter-store";
import { useEntityStore } from "@/hooks/use-entity-store";
import { useTariffStore } from "@/hooks/use-tariff-store";
import { useCostStore } from "@/hooks/use-cost-store";
import { getTariffPriceForEntity } from "@/lib/projections";

const chartConfig = {
  revenue: {
    label: "Revenu",
    color: "hsl(var(--chart-1))",
  },
  cost: {
    label: "Coûts Opérationnels",
    color: "hsl(var(--chart-5))",
  },
};


const servicesForFilter = ['Tous les services', ...SERVICES];

export function MainChart() {
  const { scenario, startYear, endYear } = useScenarioStore();
  const { selectedService, setSelectedService } = useChartFilterStore();
  const { entities } = useEntityStore();
  const { tariffs } = useTariffStore();
  const { costs } = useCostStore();

  const years = useMemo(() => {
    if (startYear > endYear) return [];
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [startYear, endYear]);

  const isAllServicesView = selectedService === 'Tous les services';

  const chartData = useMemo(() => {
    const operationalCosts = costs.filter(c => c.category !== 'À amortir');

    return years.map(year => {
      const dataPoint: any = { year };

      // --- Cost Calculation ---
      let yearTotalCost = 0;
      const indexationRate = scenario.indexationRate / 100;
      const numYearsIndexed = year > startYear ? year - startYear : 0;
      
      const relevantCosts = operationalCosts.filter(cost => {
          if (isAllServicesView) return true;
          return cost.service === selectedService;
      });

      relevantCosts.forEach(cost => {
        const costInflationFactor = (cost.category === 'Fixe' || cost.category === 'Variable') ? Math.pow(1 + indexationRate, numYearsIndexed) : 1;
        
        if (cost.category === 'Amortissement') {
            const start = cost.amortizationStartYear ?? 0;
            const duration = cost.amortizationDuration ?? 0;
            if (duration > 0 && year >= start && year < start + duration) {
                yearTotalCost += cost.annualCost;
            }
        } else {
            yearTotalCost += cost.annualCost * costInflationFactor;
        }
      });
      dataPoint.cost = Math.round(yearTotalCost / 1000);

      // --- Revenue Calculation ---
      let yearTotalRevenue = 0;
      const servicesToCalculate = isAllServicesView ? SERVICES : (SERVICES.includes(selectedService as any) ? [selectedService as Service] : []);
      const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);

      servicesToCalculate.forEach(service => {
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
        yearTotalRevenue += (baseRevenue + potentialRevenue * (adoptionRatePercent / 100));
      });

      dataPoint.revenue = Math.round((yearTotalRevenue * priceIncreaseFactor) / 1000);

      return dataPoint;
    }).sort((a,b) => a.year - b.year);

  }, [scenario, selectedService, costs, years, startYear, isAllServicesView, entities, tariffs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Projections Globales</CardTitle>
          <CardDescription>Prévisions de revenus et coûts {startYear} - {endYear} (en milliers d'€)</CardDescription>
        </div>
        <div className="w-full max-w-[200px]">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par service" />
            </SelectTrigger>
            <SelectContent>
              {servicesForFilter.map(service => (
                <SelectItem key={service} value={service}>{service}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.toString()}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `€${value}k`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />

            <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
