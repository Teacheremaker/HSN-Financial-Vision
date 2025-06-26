
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import type { ProjectionData } from "@/types"
import { useScenarioStore, initialScenarioState } from "@/hooks/use-scenario-store";

const baseChartData: ProjectionData[] = [
  { year: 2024, optimistic: 186, conservative: 80, extension: 120 },
  { year: 2025, optimistic: 305, conservative: 200, extension: 250 },
  { year: 2026, optimistic: 237, conservative: 120, extension: 180 },
  { year: 2027, optimistic: 73, conservative: 190, extension: 110 },
  { year: 2028, optimistic: 209, conservative: 130, extension: 160 },
  { year: 2029, optimistic: 214, conservative: 140, extension: 180 },
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

  const chartData = useMemo(() => {
    return baseChartData.map(dataPoint => {
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
  }, [scenarios]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Projections Financières</CardTitle>
        <CardDescription>Prévisions de revenus 2024 - 2029</CardDescription>
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
