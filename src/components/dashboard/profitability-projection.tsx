
'use client';

import * as React from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { useScenarioStore, type AdoptionRates } from '@/hooks/use-scenario-store';
import { useServiceStore } from '@/hooks/use-service-store';
import { useEntityStore } from '@/hooks/use-entity-store';
import { useTariffStore } from '@/hooks/use-tariff-store';
import { useCostStore } from '@/hooks/use-cost-store';
import { getTariffPriceForEntity } from '@/lib/projections';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 text-sm bg-background border rounded-lg shadow-lg">
                <p className="font-bold mb-2">{label}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color || pld.fill }} className="flex justify-between gap-4">
                        <span>{pld.name}:</span>
                        <span className="font-medium">{pld.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function ProfitabilityProjection() {
    const { scenario, startYear, endYear } = useScenarioStore();
    const { services: serviceDefinitions } = useServiceStore();
    const { entities } = useEntityStore();
    const { tariffs } = useTariffStore();
    const { costs } = useCostStore();

    const [selectedYear, setSelectedYear] = React.useState<number>(startYear);
    const [activeTab, setActiveTab] = React.useState('synthesis');

    const allServices = React.useMemo(() => serviceDefinitions.map(s => s.name), [serviceDefinitions]);
    const serviceColorMap = React.useMemo(() => 
        serviceDefinitions.reduce((acc, service) => {
            acc[service.name] = service.color;
            return acc;
        }, {} as Record<string, string>), 
    [serviceDefinitions]);

    React.useEffect(() => {
        if (selectedYear < startYear || selectedYear > endYear) {
            setSelectedYear(startYear);
        }
    }, [startYear, endYear, selectedYear]);

    const years = React.useMemo(() => Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i), [startYear, endYear]);

    const profitabilityData = React.useMemo(() => {
        const globalCostsTotal = costs
            .filter(c => c.service === 'Global' && c.category !== 'À amortir')
            .reduce((sum, cost) => sum + cost.annualCost, 0);

        const globalCostPerService = allServices.length > 0 ? globalCostsTotal / allServices.length : 0;

        return years.flatMap(year => {
            const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
            const indexationFactor = Math.pow(1 + (scenario.indexationRate / 100), year > startYear ? year - startYear : 0);

            return allServices.map(service => {
                // --- REVENUE ---
                let baseRevenue = 0;
                let potentialRevenue = 0;

                entities.filter(e => e.statut === 'Actif').forEach(entity => {
                    const sub = entity.services.find(s => s.name === service);
                    if (sub && year >= sub.year) {
                        baseRevenue += getTariffPriceForEntity(entity, service, tariffs);
                    }
                });

                entities.filter(e => e.statut === 'Inactif').forEach(entity => {
                    if (!entity.services.some(s => s.name === service)) {
                        potentialRevenue += getTariffPriceForEntity(entity, service, tariffs);
                    }
                });

                const adoptionRate = (scenario.adoptionRates[service as keyof AdoptionRates] ?? 0) / 100;
                const adoptionRevenue = potentialRevenue * adoptionRate;
                
                const finalBaseRevenue = baseRevenue * priceIncreaseFactor;
                const finalAdoptionRevenue = adoptionRevenue * priceIncreaseFactor;
                const totalRevenue = finalBaseRevenue + finalAdoptionRevenue;

                // --- COST ---
                let serviceSpecificCost = 0;
                costs.filter(c => c.service === service && c.category !== 'À amortir').forEach(cost => {
                    let annualCost = cost.annualCost;
                    if (cost.category === 'Amortissement') {
                        const start = cost.amortizationStartYear ?? 0;
                        const duration = cost.amortizationDuration ?? 0;
                        if (duration === 0 || year < start || year >= start + duration) {
                            annualCost = 0;
                        }
                    } else if (cost.category === 'Fixe' || cost.category === 'Variable') {
                        annualCost *= indexationFactor;
                    }
                    serviceSpecificCost += annualCost;
                });
                
                const allocatedGlobalCost = globalCostPerService * indexationFactor;
                const totalCost = serviceSpecificCost + allocatedGlobalCost;

                return {
                    year,
                    service,
                    recettes: totalRevenue,
                    couts: totalCost,
                    resultat: totalRevenue - totalCost,
                    // Detailed data for export
                    recettesBase: finalBaseRevenue,
                    recettesAdoption: finalAdoptionRevenue,
                    coutsSpecifiques: serviceSpecificCost,
                    coutsMutualises: allocatedGlobalCost,
                };
            });
        });
    }, [scenario, entities, costs, tariffs, startYear, endYear, years, allServices]);

    const synthesisChartData = React.useMemo(() => {
        return profitabilityData.filter(d => d.year === selectedYear);
    }, [profitabilityData, selectedYear]);

    const evolutionChartData = React.useMemo(() => {
        return years.map(year => {
            const yearData: { [key: string]: any } = { year };
            profitabilityData.filter(d => d.year === year).forEach(d => {
                yearData[d.service] = d.resultat;
            });
            return yearData;
        });
    }, [profitabilityData, years]);

    const handleExport = () => {
        const dataForExport = profitabilityData.map(d => ({
            'Année': d.year,
            'Service': d.service,
            'Recettes de base (€)': d.recettesBase,
            'Recettes d\'adoption (€)': d.recettesAdoption,
            'Recettes totales (€)': d.recettes,
            'Coûts spécifiques (€)': d.coutsSpecifiques,
            'Coûts mutualisés alloués (€)': d.coutsMutualises,
            'Coûts totaux (€)': d.couts,
            'Résultat (€)': d.resultat,
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        
        worksheet['!cols'] = [
            { wch: 8 },  // Année
            { wch: 15 }, // Service
            { wch: 20 }, // Recettes de base (€)
            { wch: 22 }, // Recettes d'adoption (€)
            { wch: 20 }, // Recettes totales (€)
            { wch: 20 }, // Coûts spécifiques (€)
            { wch: 28 }, // Coûts mutualisés alloués (€)
            { wch: 20 }, // Coûts totaux (€)
            { wch: 20 }, // Résultat (€)
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rentabilité détaillée');
        XLSX.writeFile(workbook, `analyse_rentabilite_detaillee_${startYear}-${endYear}.xlsx`);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <CardTitle>Analyse de Rentabilité par Service</CardTitle>
                    <CardDescription>
                        Visualisez la performance financière de chaque service.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter (XLSX)
                </Button>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="synthesis">Synthèse Annuelle</TabsTrigger>
                        <TabsTrigger value="evolution">Évolution Temporelle</TabsTrigger>
                    </TabsList>
                    <TabsContent value="synthesis" className="mt-4">
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
                            <Label>Année de la synthèse</Label>
                            <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Choisir une année" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(year => (
                                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <ChartContainer config={{}} className="h-[400px] w-full">
                            <BarChart data={synthesisChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="service" />
                                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                                <Bar dataKey="recettes" name="Recettes" radius={[4, 4, 0, 0]}>
                                    {synthesisChartData.map((entry, index) => (
                                        <Cell key={`cell-recettes-${index}`} fill={serviceColorMap[entry.service]} fillOpacity={0.6} />
                                    ))}
                                </Bar>
                                <Bar dataKey="couts" name="Coûts" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="resultat" name="Résultat" radius={[4, 4, 0, 0]}>
                                     {synthesisChartData.map((entry, index) => (
                                        <Cell key={`cell-resultat-${index}`} fill={serviceColorMap[entry.service]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                    <TabsContent value="evolution" className="mt-4">
                        <ChartContainer config={{}} className="h-[400px] w-full">
                            <LineChart data={evolutionChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                                {allServices.map(service => (
                                    <Line
                                        key={service}
                                        type="monotone"
                                        dataKey={service}
                                        name={`Résultat ${service}`}
                                        stroke={serviceColorMap[service]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                ))}
                            </LineChart>
                        </ChartContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
