
'use client';

import { useMemo } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useCostStore } from '@/hooks/use-cost-store';
import { useScenarioStore } from '@/hooks/use-scenario-store';

const chartConfig = {
  cost: {
    label: "Coûts",
    color: "hsl(var(--chart-2))",
  },
};

const services = ['Tous les services', 'GEOTER', 'SPANC', 'ROUTE', 'ADS', 'Global'];

export function OperationalCostsProjection() {
    const { costs } = useCostStore();
    const { scenarios, activeScenario, startYear, endYear, selectedService, setSelectedService } = useChartFilterStore();

    const years = useMemo(() => {
        if (startYear > endYear) return [];
        return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
    }, [startYear, endYear]);

    const chartData = useMemo(() => {
        const currentScenario = scenarios[activeScenario];
        const indexationRate = currentScenario.indexationRate / 100;
        
        return years.map(year => {
            let yearTotalCost = 0;
            const numYearsIndexed = year > startYear ? year - startYear : 0;

            const relevantCosts = costs.filter(cost => {
                if (selectedService === 'Tous les services') {
                    return true;
                }
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

            return {
                year: year,
                cost: Math.round(yearTotalCost / 1000), // in thousands of €
            };
        });
    }, [costs, selectedService, scenarios, activeScenario, startYear, years]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle>Projection des Coûts Opérationnels</CardTitle>
                    <CardDescription>Prévisions des charges annuelles {startYear} - {endYear} (en milliers d'€)</CardDescription>
                </div>
                <div className="w-full max-w-[200px]">
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrer par service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service} value={service}>{service === 'Global' ? 'Coûts Mutualisés' : service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="year"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value.toString()}
                        />
                        <YAxis
                          dataKey="cost"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          tickFormatter={(value) => `€${value}k`}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={false} name="cost" />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
