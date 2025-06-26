
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
import type { OperationalCost } from "@/types"
import { useScenarioStore, initialScenarioState, SERVICES, type AdoptionRates, type Scenarios, type Service } from "@/hooks/use-scenario-store";
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
    return {
      ...chartConfigBase,
      ...Object.fromEntries(SERVICES.map(s => [s, { label: s, color: serviceColors[s] }]))
    }
  }, []);

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

      const currentScenario = scenarios[activeScenario];
      const priceIncreaseFactor = Math.pow(1 + (currentScenario.priceIncrease / 100), year > startYear ? year - startYear : 0);

      // Determine which services to show based on the filter
      const servicesToProject = isAllServicesView ? SERVICES : [selectedService as Service];
      
      SERVICES.forEach(service => {
        if (servicesToProject.includes(service as Service)) {
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
        } else {
            // Ensure other service keys are not present or are 0 if not selected
            dataPoint[service] = 0;
        }
      });

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
            
            {SERVICES.map(service => (
              <Bar key={service} dataKey={service} fill={`var(--color-${service})`} stackId="revenue" radius={0} />
            ))}

            <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
