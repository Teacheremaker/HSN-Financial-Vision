
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import type { ProjectionData } from "@/types"
import { useScenarioStore, initialScenarioState } from "@/hooks/use-scenario-store";
import { useChartFilterStore } from "@/hooks/use-chart-filter-store";

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
}

export function MainChart() {
  const { scenarios } = useScenarioStore();
  const { selectedService, setSelectedService, getServices } = useChartFilterStore();

  const chartData = useMemo(() => {
    let dataToProcess = serviceProjectionData;

    if (selectedService !== "Tous les services") {
      dataToProcess = serviceProjectionData.filter(d => d.service === selectedService);
    }
    
    // Aggregate data by year
    const aggregatedByYear = dataToProcess.reduce((acc, curr) => {
        if (!acc[curr.year]) {
            acc[curr.year] = { year: curr.year, optimistic: 0, conservative: 0, extension: 0 };
        }
        acc[curr.year].optimistic += curr.optimistic;
        acc[curr.year].conservative += curr.conservative;
        acc[curr.year].extension += curr.extension;
        return acc;
    }, {} as Record<number, ProjectionData>);

    const finalData = Object.values(aggregatedByYear).map(dataPoint => {
      const optimisticFactor = scenarios.optimistic.adoptionRate / initialScenarioState.optimistic.adoptionRate;
      const conservativeFactor = scenarios.conservative.adoptionRate / initialScenarioState.conservative.adoptionRate;
      const extensionFactor = scenarios.extension.adoptionRate / initialScenarioState.extension.adoptionRate;

      return {
        ...dataPoint,
        optimistic: Math.round(dataPoint.optimistic * optimisticFactor),
        conservative: Math.round(dataPoint.conservative * conservativeFactor),
        extension: Math.round(dataPoint.extension * extensionFactor),
      }
    });
    
    return finalData.sort((a,b) => a.year - b.year);

  }, [scenarios, selectedService]);


  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Projections Financières</CardTitle>
          <CardDescription>Prévisions de revenus 2024 - 2029</CardDescription>
        </div>
        <div className="w-full max-w-[200px]">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par service" />
            </SelectTrigger>
            <SelectContent>
              {getServices().map(service => (
                <SelectItem key={service} value={service}>{service}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
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
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
