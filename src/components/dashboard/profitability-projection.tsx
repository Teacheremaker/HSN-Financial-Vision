
'use client';

import * as React from 'react';
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Line,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { useProfitabilityStore } from '@/hooks/use-profitability-store';
import { useEntityStore } from '@/hooks/use-entity-store';
import { useTariffStore } from '@/hooks/use-tariff-store';
import { useCostStore } from '@/hooks/use-cost-store';
import { getTariffPriceForEntity } from '@/lib/projections';
import { SERVICES as allServices } from '@/hooks/use-scenario-store';

const SERVICES = allServices.map(s => ({id: s.toLowerCase(), name: s}));

const serviceColorMap = {
    GEOTER: 'hsl(var(--chart-1))',
    SPANC: 'hsl(var(--chart-2))',
    ROUTE: 'hsl(var(--chart-3))',
    ADS: 'hsl(var(--chart-5))',
};


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const resultat = payload.find(p => p.dataKey === 'resultat');
      const recettes = payload.find(p => p.dataKey === 'recettes');
      const cout = payload.find(p => p.dataKey === 'cout');
  
      return (
        <div className="p-2 text-sm bg-background border rounded-lg shadow-lg">
          <p className="font-bold mb-2">{`Avec ${label} adhérent(s)`}</p>
           {payload.map((p, i) => (
            (p.dataKey.startsWith('recettes_') || p.dataKey.startsWith('cout_')) && p.value > 0 && (
              <p key={i} style={{ color: p.stroke || p.color }}>
                {p.name} : {p.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            )
          ))}
          {recettes && (
             <p style={{ color: recettes.stroke }}>
                Recettes : {recettes.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
          {cout && (
            <p style={{ color: cout.stroke }}>
                Coûts : {cout.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
          {resultat !== undefined && resultat.value !== undefined && (
             <p style={{ color: resultat.stroke, fontWeight: 'bold' }}>
                Résultat : {resultat.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
        </div>
      );
    }
  
    return null;
  };

export function ProfitabilityProjection() {
  const { selectedService, setSelectedService, viewMode, setViewMode } = useProfitabilityStore();
  const { entities } = useEntityStore();
  const { tariffs } = useTariffStore();
  const { costs } = useCostStore();

  const isComparativeMode = selectedService === 'Tous les services' && viewMode === 'comparative';

  const chartConfig = React.useMemo(() => {
    const serviceColor = selectedService !== 'Tous les services' 
        ? serviceColorMap[selectedService as keyof typeof serviceColorMap] 
        : 'hsl(var(--chart-1))';

    return {
      recettes: { label: 'Recettes', color: serviceColor },
      cout: { label: "Coûts", color: "hsl(var(--chart-4))" },
      resultat: { label: "Résultat d'exploitation", color: 'hsl(var(--accent))' },
      recettes_geoter: { label: 'Recettes GEOTER', color: serviceColorMap.GEOTER },
      recettes_spanc: { label: 'Recettes SPANC', color: serviceColorMap.SPANC },
      recettes_route: { label: 'Recettes ROUTE', color: serviceColorMap.ROUTE },
      recettes_ads: { label: 'Recettes ADS', color: serviceColorMap.ADS },
      cout_geoter: { label: 'Coût GEOTER', color: serviceColorMap.GEOTER },
      cout_spanc: { label: 'Coût SPANC', color: serviceColorMap.SPANC },
      cout_route: { label: 'Coût ROUTE', color: serviceColorMap.ROUTE },
      cout_ads: { label: 'Coût ADS', color: serviceColorMap.ADS },
    };
  }, [selectedService]);

  const costsByService = React.useMemo(() => {
    const result: { [key: string]: number } = {};
    const operationalCosts = costs.filter(
      (c) =>
        c.category === 'Fixe' ||
        c.category === 'Variable' ||
        c.category === 'Amortissement'
    );
    
    allServices.forEach(service => {
        result[service] = operationalCosts
            .filter(c => c.service === service)
            .reduce((sum, cost) => sum + cost.annualCost, 0);
    });

    const globalCosts = operationalCosts.filter(c => c.service === 'Global').reduce((sum, cost) => sum + cost.annualCost, 0);
    if (globalCosts > 0 && allServices.length > 0) {
        const distributedGlobalCost = globalCosts / allServices.length;
        allServices.forEach(service => {
            result[service] += distributedGlobalCost;
        });
    }

    result['Tous les services'] = allServices.reduce((sum, s) => sum + (result[s] || 0), 0);

    return result;
  }, [costs]);

  const chartData = React.useMemo(() => {
    const listToIterate = (selectedService === 'Tous les services')
        ? [...entities]
            .filter(e => e.services.length > 0)
            .sort((a, b) => Math.min(...a.services.map(s => s.year)) - Math.min(...b.services.map(s => s.year)))
        : [...entities]
            .filter(e => e.services.some(s => s.name === selectedService))
            .sort((a, b) => {
                const yearA = a.services.find(s => s.name === selectedService)!.year;
                const yearB = b.services.find(s => s.name === selectedService)!.year;
                return yearA - yearB;
            });
    
    const data = [];
    const serviceRevenueAcc: { [key: string]: number } = {};
    allServices.forEach(s => serviceRevenueAcc[s] = 0);
    let cumulativeRevenue = 0;
    
    for (let i = 0; i < listToIterate.length; i++) {
        const entity = listToIterate[i];
        
        let dataPoint: any = {
            adherentCount: i + 1,
        };

        if (isComparativeMode) {
            entity.services.forEach(serviceSubscription => {
                const price = getTariffPriceForEntity(entity, serviceSubscription.name, tariffs);
                serviceRevenueAcc[serviceSubscription.name] = (serviceRevenueAcc[serviceSubscription.name] || 0) + price;
            });
            SERVICES.forEach(s => {
                dataPoint[`recettes_${s.id}`] = serviceRevenueAcc[s.name] || 0;
                dataPoint[`cout_${s.id}`] = costsByService[s.name] || 0;
            });
        } else {
            const costForSelectedView = costsByService[selectedService] ?? 0;
            let revenueForThisAdherent = 0;
            if (selectedService === 'Tous les services') {
                entity.services.forEach(sub => {
                    revenueForThisAdherent += getTariffPriceForEntity(entity, sub.name, tariffs);
                });
            } else {
                revenueForThisAdherent = getTariffPriceForEntity(entity, selectedService, tariffs);
            }
            cumulativeRevenue += revenueForThisAdherent;
            
            dataPoint.recettes = cumulativeRevenue;
            dataPoint.cout = costForSelectedView;
            dataPoint.resultat = cumulativeRevenue - costForSelectedView;
        }
        data.push(dataPoint);
    }
    return data;
  }, [entities, tariffs, selectedService, viewMode, isComparativeMode, costsByService]);

  const breakEvenPoint = React.useMemo(() => {
    if (isComparativeMode) return null;
    const point = chartData.find(d => d.resultat >= 0);
    if (point) {
      const serviceText = selectedService === 'Tous les services' ? 'pour l\'ensemble des services' : `pour le service ${selectedService}`;

      return `Le seuil de rentabilité ${serviceText} est atteint avec ${point.adherentCount} adhérents.`;
    }
    const adherentCount = chartData.length;
    return adherentCount > 0 ? `Le seuil de rentabilité n'est pas atteint avec ${adherentCount} adhérents.` : "Aucun adhérent pour ce service.";
  }, [chartData, selectedService, isComparativeMode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projection de rentabilité interactive</CardTitle>
        <CardDescription>
          Visualisez la rentabilité en fonction du nombre d'adhérents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Choisir un service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous les services">Tous les services</SelectItem>
              {SERVICES.map(s => (
                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedService === 'Tous les services' && (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'comparative' | 'cumulative')} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="cumulative">Vue cumulée</TabsTrigger>
                <TabsTrigger value="comparative">Vue comparative</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="adherentCount" type="number" domain={['dataMin', 'dataMax']} tickCount={10} name="Adhérents" />
                <YAxis yAxisId="left" unit="€" tickFormatter={(value) => value.toLocaleString('fr-FR')} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine yAxisId="left" y={0} stroke="#dc2626" strokeDasharray="3 3" label={{ value: "Seuil de rentabilité", position: 'insideBottomLeft' }} />
                
                {!isComparativeMode && (
                    <>
                        <Line yAxisId="left" type="monotone" dataKey="recettes" name="Recettes" stroke={chartConfig.recettes.color} strokeWidth={2} dot={false} />
                        <Line yAxisId="left" type="monotone" dataKey="cout" name="Coûts" stroke={chartConfig.cout.color} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line yAxisId="left" type="monotone" dataKey="resultat" name="Résultat d'exploitation" stroke={chartConfig.resultat.color} strokeWidth={2} dot={false} />
                    </>
                )}

                {isComparativeMode &&
                  SERVICES.map((s) => {
                    const recetteConfig = chartConfig[`recettes_${s.id}` as keyof typeof chartConfig];
                    const coutConfig = chartConfig[`cout_${s.id}` as keyof typeof chartConfig];
                    return [
                      <Line
                        key={`recettes_${s.id}`}
                        yAxisId="left"
                        type="monotone"
                        dataKey={`recettes_${s.id}`}
                        name={recetteConfig.label}
                        stroke={recetteConfig.color}
                        strokeWidth={2}
                        dot={false}
                      />,
                      <Line
                        key={`cout_${s.id}`}
                        yAxisId="left"
                        type="monotone"
                        dataKey={`cout_${s.id}`}
                        name={coutConfig.label}
                        stroke={coutConfig.color}
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 5"
                      />,
                    ]
                  })}
            </ComposedChart>
        </ChartContainer>

      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">{breakEvenPoint}</p>
      </CardFooter>
    </Card>
  );
}
