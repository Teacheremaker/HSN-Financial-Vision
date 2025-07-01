
"use client"

import { useMemo } from "react";
import * as React from "react";
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { Info } from "lucide-react";

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
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
import { useScenarioStore, type AdoptionRates, type Service } from "@/hooks/use-scenario-store";
import { useChartFilterStore } from "@/hooks/use-chart-filter-store";
import { useServiceStore } from "@/hooks/use-service-store";
import { useEntityStore } from "@/hooks/use-entity-store";
import { useTariffStore } from "@/hooks/use-tariff-store";
import { useCostStore } from "@/hooks/use-cost-store";
import { getTariffPriceForEntity } from "@/lib/projections";

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
  const { services: serviceDefinitions } = useServiceStore();
  const { entities } = useEntityStore();
  const { tariffs } = useTariffStore();
  const { costs } = useCostStore();

  const serviceNames = useMemo(() => serviceDefinitions.map(s => s.name), [serviceDefinitions]);
  const servicesForFilter = useMemo(() => ['Tous les services', ...serviceNames], [serviceNames]);
  
  const years = useMemo(() => {
    if (startYear > endYear) return [];
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [startYear, endYear]);

  const isAllServicesView = selectedService === 'Tous les services';

  const chartConfig = useMemo(() => {
    const config: any = {
        cost: { label: "Coûts opérationnels", color: "hsl(var(--chart-4))" },
    };

    if (isAllServicesView) {
        serviceDefinitions.forEach(service => {
            config[service.name] = { label: service.name, color: service.color };
        });
    } else {
        const serviceDef = serviceDefinitions.find(s => s.name === selectedService);
        const color = serviceDef ? serviceDef.color : 'hsl(var(--chart-1))';
        config.baseRevenue = { label: "Revenu de base", color: color.replace(')', ' / 0.6)') };
        config.adoptionRevenue = { label: "Revenu d'adoption", color: color };
    }
    
    return config;
  }, [selectedService, serviceDefinitions, isAllServicesView]);


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
      const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
      const baseAdherentSet = new Set<string>();
      
      if (isAllServicesView) {
        let projectedAdherents = 0;
        serviceNames.forEach(service => {
            let serviceBaseRevenue = 0;
            let servicePotentialRevenue = 0;
            let potentialAdherentCount = 0;
            
            // Base from active
            entities.filter(e => e.statut === 'Actif').forEach(entity => {
                const subscription = entity.services.find(s => s.name === service);
                if (subscription && year >= subscription.year) {
                    const price = getTariffPriceForEntity(entity, service, tariffs);
                    serviceBaseRevenue += price;
                    baseAdherentSet.add(entity.id);
                }
            });

            // Potential from inactive
            entities.filter(e => e.statut === 'Inactif').forEach(entity => {
                const subscription = entity.services.find(s => s.name === service);
                if (!subscription) {
                    const price = getTariffPriceForEntity(entity, service, tariffs);
                    servicePotentialRevenue += price;
                    potentialAdherentCount++;
                }
            });

            const adoptionRate = (scenario.adoptionRates[service as keyof AdoptionRates] ?? 0) / 100;
            const serviceAdoptionRevenue = servicePotentialRevenue * adoptionRate;
            projectedAdherents += potentialAdherentCount * adoptionRate;

            const totalServiceRevenue = serviceBaseRevenue + serviceAdoptionRevenue;
            dataPoint[service] = Math.round((totalServiceRevenue * priceIncreaseFactor) / 1000);
        });
        dataPoint.projectedAdherents = Math.round(projectedAdherents);
      } else { // Single service view
        let baseRevenue = 0;
        let potentialRevenue = 0;
        let potentialAdherentCount = 0;
        const service = selectedService as Service;

        // Base revenue from active entities
        entities.filter(e => e.statut === 'Actif').forEach(entity => {
            const subscription = entity.services.find(s => s.name === service);
            if (subscription && year >= subscription.year) {
                const price = getTariffPriceForEntity(entity, service, tariffs);
                baseRevenue += price;
                baseAdherentSet.add(entity.id);
            }
        });

        // Potential revenue from inactive entities
        entities.filter(e => e.statut === 'Inactif').forEach(entity => {
            const subscription = entity.services.find(s => s.name === service);
            if(!subscription) {
                const price = getTariffPriceForEntity(entity, service, tariffs);
                potentialRevenue += price;
                potentialAdherentCount++;
            }
        });

        const adoptionRate = (scenario.adoptionRates[service] ?? 0) / 100;
        const adoptionRevenue = potentialRevenue * adoptionRate;
        dataPoint.projectedAdherents = Math.round(potentialAdherentCount * adoptionRate);

        dataPoint.baseRevenue = Math.round((baseRevenue * priceIncreaseFactor) / 1000);
        dataPoint.adoptionRevenue = Math.round((adoptionRevenue * priceIncreaseFactor) / 1000);
      }

      dataPoint.baseAdherents = baseAdherentSet.size;
      
      return dataPoint;
    }).sort((a,b) => a.year - b.year);

  }, [scenario, selectedService, costs, years, startYear, isAllServicesView, entities, tariffs, serviceNames]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Projections globales</CardTitle>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="max-w-xs text-sm">
                    <div className="space-y-3 p-2 font-normal">
                        <h4 className="font-bold">Méthodes de Calcul</h4>
                        
                        <div>
                            <h5 className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>Revenus</h5>
                            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                                <li><span className="font-medium text-foreground">Base :</span> Somme des tarifs des adhérents actifs pour l'année.</li>
                                <li><span className="font-medium text-foreground">Adoption :</span> Somme des tarifs des inactifs multipliée par le taux d'adoption du service.</li>
                                <li className="text-xs italic pt-1">Le total est ajusté par le taux d'augmentation des tarifs.</li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-semibold" style={{ color: 'hsl(var(--chart-4))' }}>Coûts</h5>
                            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                                <li><span className="font-medium text-foreground">Fixes/Variables :</span> Coût de base ajusté par le taux d'indexation annuel.</li>
                                <li><span className="font-medium text-foreground">Amortissements :</span> Coûts "À amortir" répartis sur leur durée.</li>
                            </ul>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
          </div>
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
            
            {serviceNames.map((service) => (
              <Bar 
                  key={service} 
                  dataKey={service} 
                  fill={`var(--color-${service})`} 
                  stackId="revenue" 
                  name={service}
                  hide={!isAllServicesView}
              />
            ))}
            
            <Bar dataKey="baseRevenue" fill="var(--color-baseRevenue)" stackId="revenue" name="Revenu de base" hide={isAllServicesView} />
            <Bar dataKey="adoptionRevenue" fill="var(--color-adoptionRevenue)" radius={[4, 4, 0, 0]} stackId="revenue" name="Revenu d'adoption" hide={isAllServicesView} />

            <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={{ r: 4 }} name="Coûts opérationnels" />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
