
'use client';

import { useMemo, useState } from 'react';
import { Header } from "@/components/layout/header";
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

const years = Array.from({ length: 2033 - 2025 + 1 }, (_, i) => 2025 + i);
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

export default function RevenuesPage() {
    const { scenario, startYear } = useScenarioStore();
    const { entities } = useEntityStore();
    const { tariffs } = useTariffStore();
    const [activeTab, setActiveTab] = useState('Cumulé');

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ year: number; service: string; details: ModalDetail[] } | null>(null);


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
                    
                    entities.forEach(entity => {
                        if (entity.statut !== 'Actif') return;
                        const price = getTariffPriceForEntity(entity, service, tariffs);
                        const subscription = entity.services.find(s => s.name === service);
    
                        if (subscription && year >= subscription.year) {
                            serviceBaseRevenue += price;
                        } else {
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

    }, [scenario, entities, tariffs, startYear]);

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

    return (
        <div className="flex flex-col h-full">
            <Header title="Détail des recettes" />
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
                            <TabsList>
                                {TABS.map((tab) => (
                                    <TabsTrigger key={tab} value={tab}>
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
