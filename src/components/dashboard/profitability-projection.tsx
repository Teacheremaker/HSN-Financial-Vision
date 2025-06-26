
'use client';

import * as React from 'react';
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ReferenceLine,
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
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useProfitabilityStore } from '@/hooks/use-profitability-store';
import type { Adherent } from '@/types';

// --- MOCK DATA ---
const SERVICES = [
  { id: 'geoter', name: 'GEOTER' },
  { id: 'spanc', name: 'SPANC' },
  { id: 'eau', name: "Gestion de l'eau" },
  { id: 'dechets', name: 'Collecte des déchets' },
];

const ADHERENTS: Adherent[] = [
  { id: '1', name: 'Ville A', population: 2500, status: 'Fondatrice', adhesionDate: '2024-01-15', services: ['GEOTER', 'SPANC'] },
  { id: '2', name: 'Ville B', population: 8000, status: 'Fondatrice', adhesionDate: '2024-02-20', services: ['GEOTER', "Gestion de l'eau"] },
  { id: '3', name: 'Village C', population: 950, status: 'Utilisatrice', adhesionDate: '2024-03-10', services: ['SPANC'] },
  { id: '4', name: 'Ville D', population: 12000, status: 'Utilisatrice', adhesionDate: '2024-04-05', services: ['GEOTER', 'SPANC', "Gestion de l'eau", 'Collecte des déchets'] },
  { id: '5', name: 'Ville E', population: 3200, status: 'Utilisatrice', adhesionDate: '2024-05-21', services: ['GEOTER'] },
  { id: '6', name: 'Village F', population: 1500, status: 'Utilisatrice', adhesionDate: '2024-06-18', services: ['SPANC', 'Collecte des déchets'] },
  { id: '7', name: 'Ville G', population: 25000, status: 'Utilisatrice', adhesionDate: '2024-07-01', services: ["Gestion de l'eau", 'Collecte des déchets'] },
  { id: '8', name: 'Ville H', population: 6700, status: 'Utilisatrice', adhesionDate: '2024-08-11', services: ['GEOTER', 'SPANC'] },
  { id: '9', name: 'Village I', population: 1100, status: 'Utilisatrice', adhesionDate: '2024-09-02', services: ['GEOTER'] },
  { id: '10', name: 'Ville J', population: 4500, status: 'Utilisatrice', adhesionDate: '2024-10-15', services: ['SPANC', "Gestion de l'eau"] },
  { id: '11', name: 'Ville K', population: 18000, status: 'Utilisatrice', adhesionDate: '2024-11-25', services: ['GEOTER', 'Collecte des déchets'] },
  { id: '12', name: 'Ville L', population: 7200, status: 'Utilisatrice', adhesionDate: '2024-12-30', services: ['SPANC'] },
  { id: '13', name: 'Village M', population: 600, status: 'Utilisatrice', adhesionDate: '2025-01-19', services: ['GEOTER', 'SPANC'] },
  { id: '14', name: 'Ville N', population: 9800, status: 'Utilisatrice', adhesionDate: '2025-02-22', services: ["Gestion de l'eau"] },
  { id: '15', name: 'Ville O', population: 15000, status: 'Utilisatrice', adhesionDate: '2025-03-14', services: ['GEOTER', 'Collecte des déchets', "Gestion de l'eau"] },
].sort((a, b) => new Date(a.adhesionDate).getTime() - new Date(b.adhesionDate).getTime());

const TARIFFS: { [key: string]: number } = {
  'GEOTER': 1.2,
  'SPANC': 0.8,
  "Gestion de l'eau": 2.5,
  'Collecte des déchets': 1.5,
};

const COSTS = {
  fixed: 20000, // Coût fixe annuel
  perHabitant: 0.5, // Coût variable annuel par habitant
};

const chartConfig = {
  population: { label: 'Population', color: 'hsl(var(--chart-4))' },
  recettes: { label: 'Recettes', color: 'hsl(var(--chart-1))' },
  resultat: { label: "Résultat d'exploitation", color: 'hsl(var(--chart-2))' },
  geoter: { label: 'Recettes GEOTER', color: 'hsl(var(--chart-1))' },
  spanc: { label: 'Recettes SPANC', color: 'hsl(var(--chart-2))' },
  eau: { label: "Recettes Gestion de l'eau", color: 'hsl(var(--chart-3))' },
  dechets: { label: 'Recettes Collecte des déchets', color: 'hsl(var(--chart-5))' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const population = payload.find(p => p.dataKey === 'population');
      const resultat = payload.find(p => p.dataKey === 'resultat');
  
      return (
        <div className="p-2 text-sm bg-background border rounded-lg shadow-lg">
          <p className="font-bold mb-2">{`Avec ${label} adhérent(s)`}</p>
          {population && (
            <p style={{ color: population.color }}>
              Population totale : {population.value.toLocaleString('fr-FR')}
            </p>
          )}
           {payload.map((p, i) => (
            p.dataKey.startsWith('recettes_') && (
              <p key={i} style={{ color: p.color }}>
                {p.name} : {p.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            )
          ))}
          {payload.find(p => p.dataKey === 'recettes') && (
             <p style={{ color: payload.find(p => p.dataKey === 'recettes').color }}>
                Recettes : {data.recettes.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
          {resultat && resultat.value >= 0 && (
             <p style={{ color: resultat.color }}>
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

  const isComparativeMode = selectedService === 'Tous les services' && viewMode === 'comparative';

  const chartData = React.useMemo(() => {
    const data = [];
    let currentPopulation = 0;
    
    const serviceRevenueAcc: { [key: string]: number } = {};
    SERVICES.forEach(s => serviceRevenueAcc[s.name] = 0);

    for (let i = 0; i < ADHERENTS.length; i++) {
      const adherent = ADHERENTS[i];
      currentPopulation += adherent.population;
      
      adherent.services.forEach(serviceName => {
          if (TARIFFS[serviceName]) {
            serviceRevenueAcc[serviceName] += adherent.population * TARIFFS[serviceName];
          }
      });
      
      let recettes = 0;
      if (selectedService === 'Tous les services') {
          recettes = Object.values(serviceRevenueAcc).reduce((a, b) => a + b, 0);
      } else {
          recettes = serviceRevenueAcc[selectedService] || 0;
      }

      const charges = COSTS.fixed + currentPopulation * COSTS.perHabitant;
      const resultat = recettes - charges;

      const dataPoint: any = {
        adherentCount: i + 1,
        population: currentPopulation,
        recettes,
        resultat,
      };

      if(isComparativeMode) {
        SERVICES.forEach(s => {
            dataPoint[`recettes_${s.id}`] = serviceRevenueAcc[s.name] || 0;
        })
      }

      data.push(dataPoint);
    }
    return data;
  }, [selectedService, viewMode, isComparativeMode]);

  const breakEvenPoint = React.useMemo(() => {
    const point = chartData.find(d => d.resultat >= 0);
    if (point) {
      const population = ADHERENTS.slice(0, point.adherentCount)
        .reduce((sum, a) => sum + a.population, 0);
      const serviceText = selectedService === 'Tous les services' ? 'pour l\'ensemble des services' : `pour le service ${selectedService}`;

      return `Le seuil de rentabilité ${serviceText} est atteint avec ${point.adherentCount} adhérents (soit ${population.toLocaleString('fr-FR')} habitants).`;
    }
    return `Le seuil de rentabilité n'est pas atteint avec ${ADHERENTS.length} adhérents.`;
  }, [chartData, selectedService]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projection de Rentabilité Interactive</CardTitle>
        <CardDescription>
          Visualisez la rentabilité en fonction du nombre d'adhérents et de la population.
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
                <YAxis yAxisId="right" orientation="right" unit="" name="Habitants" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine yAxisId="left" y={0} stroke="#dc2626" strokeDasharray="3 3" label={{ value: "Seuil de rentabilité", position: 'insideBottomLeft' }} />
                
                {!isComparativeMode && (
                    <>
                        <Line yAxisId="left" type="monotone" dataKey="recettes" name="Recettes" stroke={chartConfig.recettes.color} strokeWidth={2} dot={false} />
                        <Line yAxisId="left" type="monotone" dataKey="resultat" name="Résultat d'exploitation" stroke={chartConfig.resultat.color} strokeWidth={2} dot={false} />
                    </>
                )}

                {isComparativeMode && (
                    SERVICES.map(s => (
                        <Line key={s.id} yAxisId="left" type="monotone" dataKey={`recettes_${s.id}`} name={chartConfig[s.id as keyof typeof chartConfig].label} stroke={chartConfig[s.id as keyof typeof chartConfig].color} strokeWidth={2} dot={false}/>
                    ))
                )}
                
                <Bar yAxisId="right" dataKey="population" name="Population" fill={chartConfig.population.color} barSize={20} />
            </ComposedChart>
        </ChartContainer>

      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">{breakEvenPoint}</p>
      </CardFooter>
    </Card>
  );
}
