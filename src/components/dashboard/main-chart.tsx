
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
import { useScenarioStore, initialScenarioState } from "@/hooks/use-scenario-store";
import { useChartFilterStore } from "@/hooks/use-chart-filter-store";
import { initialCosts } from "@/data/costs";

type ServiceProjection = {
  year: number;
  service: string;
  optimistic: number;
  conservative: number;
  extension: number;
};

const serviceProjectionData: ServiceProjection[] = [
    // 2024
    { year: 2024, service: 'GEOTER', optimistic: 80, conservative: 40, extension: 60 },
    { year: 2024, service: 'SPANC', optimistic: 50, conservative: 20, extension: 30 },
    { year: 2024, service: 'ROUTE', optimistic: 36, conservative: 10, extension: 20 },
    { year: 2024, service: 'ADS', optimistic: 20, conservative: 10, extension: 10 },
    // 2025
    { year: 2025, service: 'GEOTER', optimistic: 120, conservative: 100, extension: 110 },
    { year: 2025, service: 'SPANC', optimistic: 85, conservative: 50, extension: 70 },
    { year: 2025, service: 'ROUTE', optimistic: 60, conservative: 30, extension: 40 },
    { year: 2025, service: 'ADS', optimistic: 40, conservative: 20, extension: 30 },
    // 2026
    { year: 2026, service: 'GEOTER', optimistic: 100, conservative: 60, extension: 80 },
    { year: 2026, service: 'SPANC', optimistic: 70, conservative: 30, extension: 50 },
    { year: 2026, service: 'ROUTE', optimistic: 47, conservative: 20, extension: 30 },
    { year: 2026, service: 'ADS', optimistic: 20, conservative: 10, extension: 20 },
    // 2027
    { year: 2027, service: 'GEOTER', optimistic: 30, conservative: 90, extension: 50 },
    { year: 2027, service: 'SPANC', optimistic: 20, conservative: 50, extension: 30 },
    { year: 2027, service: 'ROUTE', optimistic: 13, conservative: 30, extension: 20 },
    { year: 2027, service: 'ADS', optimistic: 10, conservative: 20, extension: 10 },
    // 2028
    { year: 2028, service: 'GEOTER', optimistic: 90, conservative: 60, extension: 70 },
    { year: 2028, service: 'SPANC', optimistic: 60, conservative: 40, extension: 50 },
    { year: 2028, service: 'ROUTE', optimistic: 39, conservative: 20, extension: 25 },
    { year: 2028, service: 'ADS', optimistic: 20, conservative: 10, extension: 15 },
    // 2029
    { year: 2029, service: 'GEOTER', optimistic: 94, conservative: 70, extension: 80 },
    { year: 2029, service: 'SPANC', optimistic: 60, conservative: 40, extension: 50 },
    { year: 2029, service: 'ROUTE', optimistic: 40, conservative: 20, extension: 30 },
    { year: 2029, service: 'ADS', optimistic: 20, conservative: 10, extension: 20 },
];


const chartConfig = {
  revenue: {
    label: "Revenu (en milliers d'€)",
  },
  optimistic: {
    label: "Optimiste",
    color: "hsl(var(--chart-1))",
  },
  conservative: {
    label: "Conservateur",
    color: "hsl(var(--chart-2))",
  },
  extension: {
    label: "Extension",
    color: "hsl(var(--chart-4))",
  },
  cost: {
    label: "Coûts Opérationnels",
    color: "hsl(var(--chart-5))",
  },
}

const servicesForFilter = ['Tous les services', 'GEOTER', 'SPANC', 'ROUTE', 'ADS', 'Coûts Mutualisés'];
const years = Array.from({ length: 6 }, (_, i) => 2024 + i);

export function MainChart() {
  const { scenarios, activeScenario } = useScenarioStore();
  const { selectedService, setSelectedService } = useChartFilterStore();
  const [costs, setCosts] = useState<OperationalCost[]>(initialCosts);

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

  const chartData = useMemo(() => {
    // 1. Calculate revenue projections
    let revenueDataToProcess = serviceProjectionData;
    if (selectedService === 'Global') {
        revenueDataToProcess = [];
    } else if (selectedService !== "Tous les services") {
      revenueDataToProcess = serviceProjectionData.filter(d => d.service === selectedService);
    }
    
    const aggregatedRevenueByYear = revenueDataToProcess.reduce((acc, curr) => {
        if (!acc[curr.year]) {
            acc[curr.year] = { year: curr.year, optimistic: 0, conservative: 0, extension: 0 };
        }
        acc[curr.year].optimistic += curr.optimistic;
        acc[curr.year].conservative += curr.conservative;
        acc[curr.year].extension += curr.extension;
        return acc;
    }, {} as Record<number, Omit<ProjectionData, "cost">>);

    // 2. Calculate cost projections with indexation
    const costDataByYear = years.map(year => {
      let yearTotalCost = 0;
      const relevantCosts = costs.filter(cost => {
          if (selectedService === 'Tous les services') {
              return true;
          }
          return cost.service === selectedService;
      });

      const currentScenario = scenarios[activeScenario];
      const indexationRate = currentScenario.indexationRate / 100;
      const baseYear = 2024;
      const numYearsIndexed = year > baseYear ? year - baseYear : 0;
      
      relevantCosts.forEach(cost => {
          if (cost.category === 'Fixe' || cost.category === 'Variable') {
              // Apply indexation cumulatively from the base year
              const indexedCost = cost.annualCost * Math.pow(1 + indexationRate, numYearsIndexed);
              yearTotalCost += indexedCost;
          } else if (cost.category === 'Amortissement') {
              // Amortization is not indexed
              const startYear = cost.amortizationStartYear ?? 0;
              const duration = cost.amortizationDuration ?? 0;
              if (duration > 0 && year >= startYear && year < startYear + duration) {
                  yearTotalCost += cost.annualCost;
              }
          }
      });

      return {
          year,
          cost: Math.round(yearTotalCost / 1000), // in thousands of €
      };
    });

    // 3. Merge data and apply scenario factors
    return years.map(year => {
      const revenueForYear = aggregatedRevenueByYear[year] || { year, optimistic: 0, conservative: 0, extension: 0 };
      const costForYear = costDataByYear.find(c => c.year === year);
      
      const baseYear = 2024;
      const numYearsIncreased = year > baseYear ? year - baseYear : 0;

      // Factors for each scenario
      const optimisticAdoptionFactor = scenarios.optimistic.adoptionRate / initialScenarioState.optimistic.adoptionRate;
      const conservativeAdoptionFactor = scenarios.conservative.adoptionRate / initialScenarioState.conservative.adoptionRate;
      const extensionAdoptionFactor = scenarios.extension.adoptionRate / initialScenarioState.extension.adoptionRate;

      const optimisticPriceIncreaseFactor = Math.pow(1 + (scenarios.optimistic.priceIncrease / 100), numYearsIncreased);
      const conservativePriceIncreaseFactor = Math.pow(1 + (scenarios.conservative.priceIncrease / 100), numYearsIncreased);
      const extensionPriceIncreaseFactor = Math.pow(1 + (scenarios.extension.priceIncrease / 100), numYearsIncreased);

      return {
        year: year,
        optimistic: Math.round(revenueForYear.optimistic * optimisticAdoptionFactor * optimisticPriceIncreaseFactor),
        conservative: Math.round(revenueForYear.conservative * conservativeAdoptionFactor * conservativePriceIncreaseFactor),
        extension: Math.round(revenueForYear.extension * extensionAdoptionFactor * extensionPriceIncreaseFactor),
        cost: costForYear ? costForYear.cost : 0,
      };
    }).sort((a,b) => a.year - b.year);

  }, [scenarios, activeScenario, selectedService, costs]);
  
  const handleServiceChange = (value: string) => {
    const filterKey = value === 'Coûts Mutualisés' ? 'Global' : value;
    setSelectedService(filterKey);
  };

  const selectedValue = selectedService === 'Global' ? 'Coûts Mutualisés' : selectedService;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Projections Globales</CardTitle>
          <CardDescription>Prévisions de revenus et coûts 2024 - 2029 (en milliers d'€)</CardDescription>
        </div>
        <div className="w-full max-w-[200px]">
          <Select value={selectedValue} onValueChange={handleServiceChange}>
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
            <Bar dataKey="conservative" fill="var(--color-conservative)" radius={4} />
            <Bar dataKey="extension" fill="var(--color-extension)" radius={4} />
            <Bar dataKey="optimistic" fill="var(--color-optimistic)" radius={4} />
            <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
