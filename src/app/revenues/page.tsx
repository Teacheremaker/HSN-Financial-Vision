
'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Header } from "@/components/layout/header";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useScenarioStore, SERVICES, type AdoptionRates, type Service } from "@/hooks/use-scenario-store";
import { useEntityStore } from "@/hooks/use-entity-store";
import { useTariffStore } from "@/hooks/use-tariff-store";
import { getTariffPriceForEntity } from "@/lib/projections";
import { cn } from '@/lib/utils';

const TABS = ['Cumulé', ...SERVICES];

type RevenueData = {
    year: number;
    baseRevenue: number;
    additionalRevenue: number;
    totalRevenue: number;
};

type ModalDetail = {
    entityName: string;
    entityType: string;
    serviceName: string;
    price: number;
};

const serviceColorMap: Record<string, string> = {
    GEOTER: 'data-[state=active]:border-chart-1 text-chart-1',
    SPANC: 'data-[state=active]:border-chart-2 text-chart-2',
    ROUTE: 'data-[state=active]:border-chart-3 text-chart-3',
    ADS: 'data-[state=active]:border-chart-5 text-chart-5',
};

export default function RevenuesPage() {
    const { scenario, startYear, endYear } = useScenarioStore();
    const { entities } = useEntityStore();
    const { tariffs } = useTariffStore();
    const [activeTab, setActiveTab] = useState('Cumulé');

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ year: number; service: string; details: ModalDetail[] } | null>(null);

    const years = useMemo(() => {
        if (startYear > endYear) return [];
        return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    }, [startYear, endYear]);


    const revenueDataByService = useMemo(() => {
        const data: { [key: string]: RevenueData[] } = {};

        TABS.forEach(tab => {
            const tabData: RevenueData[] = [];

            years.forEach(year => {
                let baseRevenue = 0;
                let additionalRevenue = 0;

                const servicesToCalculate = tab === 'Cumulé' ? SERVICES : [tab as Service];
                
                servicesToCalculate.forEach(service => {
                    let serviceBaseRevenue = 0;
                    let servicePotentialRevenue = 0;
                    
                    // Base revenue from active entities
                    entities.filter(e => e.statut === 'Actif').forEach(entity => {
                        const subscription = entity.services.find(s => s.name === service);
                        if (subscription && year >= subscription.year) {
                            const price = getTariffPriceForEntity(entity, service, tariffs);
                            serviceBaseRevenue += price;
                        }
                    });

                    // Potential revenue from inactive entities
                    entities.filter(e => e.statut === 'Inactif').forEach(entity => {
                        const subscription = entity.services.find(s => s.name === service);
                        if (!subscription) {
                            const price = getTariffPriceForEntity(entity, service, tariffs);
                            servicePotentialRevenue += price;
                        }
                    });

                    const serviceKey = service as keyof AdoptionRates;
                    const adoptionRatePercent = scenario.adoptionRates[serviceKey];
                    const serviceAdditionalRevenue = servicePotentialRevenue * (adoptionRatePercent / 100);

                    baseRevenue += serviceBaseRevenue;
                    additionalRevenue += serviceAdditionalRevenue;
                });
                
                const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
                const finalBaseRevenue = baseRevenue * priceIncreaseFactor;
                const finalAdditionalRevenue = additionalRevenue * priceIncreaseFactor;

                tabData.push({
                    year: year,
                    baseRevenue: finalBaseRevenue,
                    additionalRevenue: finalAdditionalRevenue,
                    totalRevenue: finalBaseRevenue + finalAdditionalRevenue,
                });
            });
            data[tab] = tabData;
        });

        return data;

    }, [scenario, entities, tariffs, startYear, years]);

    const handleYearClick = (year: number, serviceTab: string) => {
        const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
    
        const servicesToConsider = serviceTab === 'Cumulé' ? SERVICES : [serviceTab as Service];
        
        const details: ModalDetail[] = [];
    
        entities.forEach(entity => {
            if (entity.statut !== 'Actif') return;
            
            servicesToConsider.forEach(service => {
                const subscription = entity.services.find(s => s.name === service);
                if (subscription && year >= subscription.year) {
                    const basePrice = getTariffPriceForEntity(entity, service, tariffs);
                    const finalPrice = basePrice * priceIncreaseFactor;
                    details.push({
                        entityName: entity.nom,
                        entityType: entity.type,
                        serviceName: service,
                        price: finalPrice
                    });
                }
            });
        });
    
        details.sort((a, b) => {
            if (a.serviceName < b.serviceName) return -1;
            if (a.serviceName > b.serviceName) return 1;
            if (a.entityName < b.entityName) return -1;
            if (a.entityName > b.entityName) return 1;
            return 0;
        });
    
        setModalData({ year, service: serviceTab, details });
        setIsDetailsModalOpen(true);
    };
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleExport = () => {
        const dataForExport: any[] = [];
    
        entities.filter(e => e.statut === 'Actif').forEach(entity => {
            entity.services.forEach(subscription => {
                const basePrice = getTariffPriceForEntity(entity, subscription.name as Service, tariffs);
    
                const rowData: { [key: string]: string | number } = {
                    'Entité': entity.nom,
                    'Type': entity.type,
                    'Service': subscription.name,
                    'Année de souscription': subscription.year,
                    'Tarif de base Annuel (€)': basePrice,
                };
    
                years.forEach(year => {
                    let projectedRevenue = 0;
                    if (year >= subscription.year) {
                        const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
                        projectedRevenue = basePrice * priceIncreaseFactor;
                    }
                    rowData[`Recette projetée ${year} (€)`] = parseFloat(projectedRevenue.toFixed(2));
                });
                dataForExport.push(rowData);
            });
        });
    
        if (dataForExport.length === 0) {
            return;
        }
    
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Détail Recettes Adhérents');
    
        const cols = Object.keys(dataForExport[0] || {}).map(key => ({
             wch: key.includes('Entité') ? 40 : (key.length < 20 ? 20 : key.length + 5) 
        }));
        worksheet['!cols'] = cols;
    
        XLSX.writeFile(workbook, 'projection_recettes_adherents.xlsx');
    };

    return (
        <div className="flex flex-col h-full">
            <Header 
                title="Détail des recettes"
                actions={
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Exporter les détails
                    </Button>
                }
            />
            <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Recettes par année et par service</CardTitle>
                        <CardDescription>
                            Projections des recettes basées sur les entités et le scénario actuel. Cliquez sur une ligne pour voir le détail des adhérents.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-transparent p-0">
                                {TABS.map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        className={cn(
                                            "rounded-none border-b-2 border-transparent p-2 transition-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=inactive]:opacity-60",
                                            "data-[state=active]:border-primary data-[state=active]:text-primary",
                                            serviceColorMap[tab]
                                        )}
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {TABS.map((tab) => {
                                const tableData = revenueDataByService[tab] ?? [];
                                const totals = tableData.reduce((acc, curr) => {
                                    acc.baseRevenue += curr.baseRevenue;
                                    acc.additionalRevenue += curr.additionalRevenue;
                                    acc.totalRevenue += curr.totalRevenue;
                                    return acc;
                                }, { baseRevenue: 0, additionalRevenue: 0, totalRevenue: 0 });

                                return (
                                <TabsContent key={tab} value={tab}>
                                    <div className="mt-4 rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Année</TableHead>
                                                    <TableHead className="text-right">Recettes de base (adhérents)</TableHead>
                                                    <TableHead className="text-right">Recettes additionnelles (adoption)</TableHead>
                                                    <TableHead className="text-right">Recettes totales projetées</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tableData.map((data) => (
                                                    <TableRow 
                                                        key={data.year}
                                                        onClick={() => handleYearClick(data.year, tab)}
                                                        className="cursor-pointer"
                                                    >
                                                        <TableCell className="font-medium">{data.year}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(data.baseRevenue)}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(data.additionalRevenue)}</TableCell>
                                                        <TableCell className="text-right font-semibold">{formatCurrency(data.totalRevenue)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow className="bg-muted/50">
                                                    <TableCell className="font-bold">Total</TableCell>
                                                    <TableCell className="text-right font-bold">{formatCurrency(totals.baseRevenue)}</TableCell>
                                                    <TableCell className="text-right font-bold">{formatCurrency(totals.additionalRevenue)}</TableCell>
                                                    <TableCell className="text-right font-bold text-lg">{formatCurrency(totals.totalRevenue)}</TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </div>
                                </TabsContent>
                                )
                            })}
                        </Tabs>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Détail des recettes de base pour {modalData?.service} en {modalData?.year}</DialogTitle>
                        <DialogDescription>
                            Liste des entités adhérentes et le montant de leur contribution pour l'année sélectionnée.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entité</TableHead>
                                    <TableHead>Type</TableHead>
                                    {modalData?.service === 'Cumulé' && <TableHead>Service</TableHead>}
                                    <TableHead className="text-right">Contribution annuelle (€)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modalData?.details && modalData.details.length > 0 ? (
                                    modalData.details.map((detail, index) => (
                                        <TableRow key={`${detail.entityName}-${detail.serviceName}-${index}`}>
                                            <TableCell className="font-medium">{detail.entityName}</TableCell>
                                            <TableCell>{detail.entityType}</TableCell>
                                            {modalData.service === 'Cumulé' && <TableCell>{detail.serviceName}</TableCell>}
                                            <TableCell className="text-right">{formatCurrency(detail.price)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={modalData?.service === 'Cumulé' ? 4 : 3} className="h-24 text-center">
                                            Aucune recette de base pour cette sélection.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
