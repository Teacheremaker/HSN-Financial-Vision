
"use client"

import { useMemo } from "react";
import * as React from "react";
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
  baseRevenue: {
    label: "Revenu de base",
    color: "hsl(var(--chart-1))",
  },
  adoptionRevenue: {
    label: "Revenu d'adoption",
    color: "hsl(var(--chart-2))",
  },
  cost: {
    label: "Coûts opérationnels",
    color: "hsl(var(--chart-5))",
  },
};


const servicesForFilter = ['Tous les services', ...SERVICES];

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border bg-background p-2.5 text-sm shadow-sm">
                <div className="grid gap-1.5">
                    <p className="font-medium">{label}</p>
                    <div className="grid gap-1">
                        {payload.map((pld: any) => (
                            pld.value > 0 && (
                            <div key={pld.dataKey} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: pld.color}} />
                                    <span>{pld.name}</span>
                                </div>
                                <span className="font-medium text-right">
                                    €{pld.value.toLocaleString('fr-FR')}k
                                </span>
                            </div>
                            )
                        ))}
                    </div>
                    <div className="my-1 border-t border-border" />
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Adhérents de base</span>
                        <span className="font-medium">{data.baseAdherents}</span>
                    </div>
                    {data.projectedAdherents > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Adhérents projetés</span>
                            <span className="font-medium">{data.projectedAdherents}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};


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
      const indexationFactor = Math.pow(1 + indexationRate, numYearsIndexed);

      const relevantCosts = operationalCosts.filter(cost => {
          if (isAllServicesView) return true;
          return cost.service === selectedService;
      });

      relevantCosts.forEach(cost => {
        if (cost.category === 'Amortissement') {
            const start = cost.amortizationStartYear ?? 0;
            const duration = cost.amortizationDuration ?? 0;
            if (duration > 0 && year >= start && year < start + duration) {
                yearTotalCost += cost.annualCost;
            }
        } else {
            const costInflationFactor = (cost.category === 'Fixe' || cost.category === 'Variable') ? indexationFactor : 1;
            yearTotalCost += cost.annualCost * costInflationFactor;
        }
      });
      dataPoint.cost = Math.round(yearTotalCost / 1000);

      // --- Revenue & Adherent Calculation ---
      let yearBaseRevenue = 0;
      let yearAdoptionRevenue = 0;
      const baseAdherentSet = new Set<string>();
      let projectedAdherents = 0;
      
      const servicesToCalculate = isAllServicesView ? SERVICES : (SERVICES.includes(selectedService as any) ? [selectedService as Service] : []);
      const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);

      servicesToCalculate.forEach(service => {
        let baseRevenue = 0;
        let potentialRevenue = 0;
        let potentialAdherentCount = 0;

        entities.forEach(entity => {
            if (entity.statut !== 'Actif') return;
            const price = getTariffPriceForEntity(entity, service, tariffs);
            const subscription = entity.services.find(s => s.name === service);

            if (subscription) {
                if (year >= subscription.year) {
                    baseRevenue += price;
                    baseAdherentSet.add(entity.id);
                }
            } else {
                potentialRevenue += price;
                potentialAdherentCount++;
            }
        });

        const serviceKey = service as keyof AdoptionRates;
        const adoptionRatePercent = scenario.adoptionRates[serviceKey];
        yearBaseRevenue += baseRevenue;
        yearAdoptionRevenue += potentialRevenue * (adoptionRatePercent / 100);
        projectedAdherents += potentialAdherentCount * (adoptionRatePercent / 100);
      });

      dataPoint.baseRevenue = Math.round((yearBaseRevenue * priceIncreaseFactor) / 1000);
      dataPoint.adoptionRevenue = Math.round((yearAdoptionRevenue * priceIncreaseFactor) / 1000);
      dataPoint.baseAdherents = baseAdherentSet.size;
      dataPoint.projectedAdherents = Math.round(projectedAdherents);

      return dataPoint;
    }).sort((a,b) => a.year - b.year);

  }, [scenario, selectedService, costs, years, startYear, isAllServicesView, entities, tariffs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Projections globales</CardTitle>
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
              content={<CustomTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            
            <Bar dataKey="baseRevenue" fill="var(--color-baseRevenue)" stackId="revenue" name="Revenu de base" />
            <Bar dataKey="adoptionRevenue" fill="var(--color-adoptionRevenue)" radius={[4, 4, 0, 0]} stackId="revenue" name="Revenu d'adoption" />

            <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={{ r: 4 }} name="Coûts opérationnels" />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
