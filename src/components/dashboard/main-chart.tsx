
"use client"

import { useMemo, useState, useEffect } from "react";
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
import type { ProjectionData, OperationalCost } from "@/types"
import { useScenarioStore, initialScenarioState, SERVICES, type AdoptionRates, type Scenarios } from "@/hooks/use-scenario-store";
import { useChartFilterStore } from "@/hooks/use-chart-filter-store";
import { initialCosts } from "@/data/costs";
import { serviceProjectionData } from "@/data/projections";

const chartConfigBase = {
  revenue: {
    label: "Revenu (en milliers d'€)",
  },
  cost: {
    label: "Coûts Opérationnels",
    color: "hsl(var(--chart-5))",
  },
}

const scenarioColors: {[key in keyof Scenarios]: string} = {
  optimistic: "hsl(var(--chart-1))",
  conservative: "hsl(var(--chart-2))",
  extension: "hsl(var(--chart-4))",
}

const serviceColors: {[key: string]: string} = {
  GEOTER: "hsl(var(--chart-1))",
  SPANC: "hsl(var(--chart-2))",
  ROUTE: "hsl(var(--chart-3))",
  ADS: "hsl(var(--chart-4))",
}

const servicesForFilter = ['Tous les services', ...SERVICES];

export function MainChart() {
  const { scenarios, activeScenario, startYear, endYear } = useScenarioStore();
  const { selectedService, setSelectedService } = useChartFilterStore();
  const [costs, setCosts] = useState<OperationalCost[]>(initialCosts);
  const years = useMemo(() => {
    if (startYear > endYear) return [];
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [startYear, endYear]);

  useEffect(() => {
      try {
          const savedCosts = localStorage.getItem('hsn-operational-costs');
          if (savedCosts) {
              setCosts(JSON.parse(savedCosts));
          }
      } catch (error) {
          console.error("Failed to parse costs from localStorage", error);
      }
  }, []);
  
  const isAllServicesView = selectedService === 'Tous les services';

  const chartConfig = useMemo(() => {
    if (isAllServicesView) {
        return {
            ...chartConfigBase,
            ...Object.fromEntries(SERVICES.map(s => [s, { label: s, color: serviceColors[s] }]))
        }
    }
    return {
      ...chartConfigBase,
      optimistic: { label: "Optimiste", color: scenarioColors.optimistic },
      conservative: { label: "Conservateur", color: scenarioColors.conservative },
      extension: { label: "Extension", color: scenarioColors.extension },
    }
  }, [isAllServicesView]);

  const chartData = useMemo(() => {
    const costByYear = new Map<number, number>();
    years.forEach(year => {
        let yearTotalCost = 0;
        const relevantCosts = costs.filter(cost => {
            if (selectedService === 'Tous les services') return true;
            return cost.service === selectedService;
        });

        const currentScenario = scenarios[activeScenario];
        const indexationRate = currentScenario.indexationRate / 100;
        const numYearsIndexed = year > startYear ? year - startYear : 0;
        
        relevantCosts.forEach(cost => {
            if (cost.category === 'Fixe' || cost.category === 'Variable') {
                const indexedCost = cost.annualCost * Math.pow(1 + indexationRate, numYearsIndexed);
                yearTotalCost += indexedCost;
            } else if (cost.category === 'Amortissement') {
                const startYear = cost.amortizationStartYear ?? 0;
                const duration = cost.amortizationDuration ?? 0;
                if (duration > 0 && year >= startYear && year < startYear + duration) {
                    yearTotalCost += cost.annualCost;
                }
            }
        });
        costByYear.set(year, Math.round(yearTotalCost / 1000));
    });

    return years.map(year => {
      const dataPoint: any = {
        year: year,
        cost: costByYear.get(year) || 0,
      };

      if (isAllServicesView) {
        // --- Aggregate revenue from all services for the active scenario ---
        const currentScenario = scenarios[activeScenario];
        const priceIncreaseFactor = Math.pow(1 + (currentScenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
        
        SERVICES.forEach(service => {
          const serviceDataForYear = serviceProjectionData.find(d => d.year === year && d.service === service);
          if (!serviceDataForYear) {
            dataPoint[service] = 0;
            return;
          }
          
          const serviceKey = service as keyof AdoptionRates;
          const initialAdoptionRate = initialScenarioState[activeScenario].adoptionRates[serviceKey];
          const adoptionFactor = initialAdoptionRate > 0 ? currentScenario.adoptionRates[serviceKey] / initialAdoptionRate : 1;
          const revenueForService = (serviceDataForYear[activeScenario] * 1000) * adoptionFactor * priceIncreaseFactor;
          dataPoint[service] = Math.round(revenueForService / 1000);
        });

      } else {
        // --- Show different scenarios for the selected service ---
        Object.keys(scenarios).forEach(scenarioKey => {
            const scenario = scenarios[scenarioKey as keyof Scenarios];
            const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
            const serviceDataForYear = serviceProjectionData.find(d => d.year === year && d.service === selectedService);
            
            if (serviceDataForYear) {
                const serviceKey = selectedService as keyof AdoptionRates;
                const initialAdoptionRate = initialScenarioState[scenarioKey as keyof Scenarios].adoptionRates[serviceKey];
                const adoptionFactor = initialAdoptionRate > 0 ? scenario.adoptionRates[serviceKey] / initialAdoptionRate : 1;
                const revenue = (serviceDataForYear[scenarioKey as keyof Scenarios] * 1000) * adoptionFactor * priceIncreaseFactor;
                dataPoint[scenarioKey] = Math.round(revenue / 1000);
            } else {
                dataPoint[scenarioKey] = 0;
            }
        });
      }
      return dataPoint;
    }).sort((a,b) => a.year - b.year);

  }, [scenarios, activeScenario, selectedService, costs, years, startYear, isAllServicesView]);

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
            
            {isAllServicesView ? (
              SERVICES.map(service => (
                <Bar key={service} dataKey={service} fill={`var(--color-${service})`} stackId="revenue" radius={0} />
              ))
            ) : (
              <>
                <Bar dataKey="conservative" fill="var(--color-conservative)" radius={4} />
                <Bar dataKey="extension" fill="var(--color-extension)" radius={4} />
                <Bar dataKey="optimistic" fill="var(--color-optimistic)" radius={4} />
              </>
            )}

            <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
