
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import type { OperationalCost } from '@/types';
import { initialCosts } from '@/data/costs';

const chartConfig = {
  cost: {
    label: "Coûts",
    color: "hsl(var(--chart-2))",
  },
};

const years = Array.from({ length: 9 }, (_, i) => 2025 + i);
const services = ['Tous les services', 'GEOTER', 'SPANC', 'ROUTE', 'ADS', 'Global'];

export function OperationalCostsProjection() {
    const [costs, setCosts] = useState<OperationalCost[]>(initialCosts);
    const [selectedService, setSelectedService] = useState('Tous les services');

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
        return years.map(year => {
            let yearTotalCost = 0;

            const relevantCosts = costs.filter(cost => {
                if (selectedService === 'Tous les services') {
                    return true;
                }
                return cost.service === selectedService;
            });
            
            relevantCosts.forEach(cost => {
                if (cost.category === 'Fixe' || cost.category === 'Variable') {
                    yearTotalCost += cost.annualCost;
                } else if (cost.category === 'Amortissement') {
                    const startYear = cost.amortizationStartYear ?? 0;
                    const duration = cost.amortizationDuration ?? 0;
                    if (duration > 0 && year >= startYear && year < startYear + duration) {
                        yearTotalCost += cost.annualCost;
                    }
                }
            });

            return {
                year: year,
                cost: Math.round(yearTotalCost / 1000), // in thousands of €
            };
        });
    }, [costs, selectedService]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle>Projection des Coûts Opérationnels</CardTitle>
                    <CardDescription>Prévisions des charges annuelles 2025 - 2033 (en milliers d'€)</CardDescription>
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
