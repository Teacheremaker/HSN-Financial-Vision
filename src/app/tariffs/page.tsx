
'use client';

import { useState } from 'react';
import { PlusCircle, Save, MoreHorizontal, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tariff } from "@/types";
import { useToast } from '@/hooks/use-toast';
import { useTariffStore } from '@/hooks/use-tariff-store';
import { cn } from '@/lib/utils';

const services = ["GEOTER", "SPANC", "ROUTE", "ADS"];

const serviceColorMap: Record<string, string> = {
    GEOTER: 'data-[state=active]:border-chart-1 text-chart-1',
    SPANC: 'data-[state=active]:border-chart-2 text-chart-2',
    ROUTE: 'data-[state=active]:border-chart-3 text-chart-3',
    ADS: 'data-[state=active]:border-chart-5 text-chart-5',
};

export default function TariffsPage() {
    const { toast } = useToast();
    const { tariffs, updateTariff, addTariff, deleteTariff } = useTariffStore();
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(services[0] ?? "");

    const handleSaveChanges = () => {
        // With Zustand, changes are saved automatically.
        toast({
            title: "Modifications enregistrées",
            description: "La grille tarifaire a été mise à jour.",
        });
    };

    const handleUpdate = (id: string, field: keyof Tariff, value: any) => {
        updateTariff(id, field, value);
    };

    const handleAddNew = () => {
        const newId = `T-${String(Date.now()).slice(-5)}`;
        const newTariff: Tariff = {
            id: newId,
            service: activeTab,
            category: "Nouvelle strate/catégorie",
        };
        addTariff(newTariff);
        setEditingRowId(newId);
    };

    const handleDelete = (id: string) => {
        deleteTariff(id);
    };

    const filteredTariffs = tariffs.filter(tariff => tariff.service === activeTab);

    const renderPrice = (price?: number) => price?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? <span className="text-muted-foreground">-</span>;
    const renderPopulation = (tariff: Tariff) => {
        if (tariff.populationMin !== undefined && tariff.populationMax !== undefined) {
            return `${tariff.populationMin.toLocaleString('fr-FR')} - ${tariff.populationMax.toLocaleString('fr-FR')}`;
        }
        return <span className="text-muted-foreground">-</span>;
    }

    const getCategoryClass = (category: string): string => {
        const lowerCategory = category.toLowerCase();
        if (lowerCategory.includes('commune') && !lowerCategory.includes('communauté')) {
            return 'bg-blue-50 dark:bg-blue-950/60';
        }
        if (lowerCategory.includes('syndicat')) {
            return 'bg-green-50 dark:bg-green-950/60';
        }
        if (lowerCategory.includes('communauté')) {
            return 'bg-yellow-50 dark:bg-yellow-950/60';
        }
        return '';
    };

  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Grille tarifaire détaillée"
            actions={
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un tarif
                    </Button>
                    <Button onClick={handleSaveChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                    </Button>
                </div>
            }
        />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
            <Card>
                <CardHeader>
                    <CardTitle>Tarifs des services</CardTitle>
                    <CardDescription>
                        Naviguez entre les services pour voir et modifier les grilles tarifaires. Les prix sont en euros HT.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => { setEditingRowId(null); setActiveTab(value); }} className="w-full">
                        <TabsList className="bg-transparent p-0">
                            {services.map((service) => (
                                <TabsTrigger 
                                    key={service} 
                                    value={service}
                                    className={cn(
                                        "rounded-none border-b-2 border-transparent p-2 transition-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=inactive]:opacity-60",
                                        serviceColorMap[service]
                                    )}
                                >
                                    {service}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="mt-4 rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Strate/Catégorie</TableHead>
                                    <TableHead>Population</TableHead>
                                    <TableHead className="text-right">Prix fondateur (€)</TableHead>
                                    <TableHead className="text-right">Prix utilisateur (€)</TableHead>
                                    <TableHead className="text-right">Remise fond. (%)</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTariffs.length > 0 ? filteredTariffs.map((tariff) => {
                                    const isEditing = editingRowId === tariff.id;
                                    return (
                                    <TableRow key={tariff.id} className={getCategoryClass(tariff.category)}>
                                        <TableCell className="font-medium">
                                            {isEditing ? <Input value={tariff.category} onChange={(e) => handleUpdate(tariff.id, 'category', e.target.value)} className="h-8" /> : tariff.category}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <Input type="number" placeholder="Min" value={tariff.populationMin ?? ''} onChange={e => handleUpdate(tariff.id, 'populationMin', e.target.value ? parseInt(e.target.value) : undefined)} className="h-8 w-24" />
                                                    <Input type="number" placeholder="Max" value={tariff.populationMax ?? ''} onChange={e => handleUpdate(tariff.id, 'populationMax', e.target.value ? parseInt(e.target.value) : undefined)} className="h-8 w-24" />
                                                </div>
                                            ) : renderPopulation(tariff)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isEditing ? <Input type="number" value={tariff.priceFounder ?? ''} onChange={e => handleUpdate(tariff.id, 'priceFounder', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-8 text-right" /> : renderPrice(tariff.priceFounder)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isEditing ? <Input type="number" value={tariff.priceUser ?? ''} onChange={e => handleUpdate(tariff.id, 'priceUser', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-8 text-right" /> : renderPrice(tariff.priceUser)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isEditing ? <Input type="number" value={tariff.discountFounder ?? ''} onChange={e => handleUpdate(tariff.id, 'discountFounder', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-8 text-right" /> : (tariff.discountFounder !== undefined ? `${tariff.discountFounder}%` : <span className="text-muted-foreground">-</span>)}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? <Input value={tariff.notes ?? ''} onChange={(e) => handleUpdate(tariff.id, 'notes', e.target.value)} className="h-8" /> : tariff.notes}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isEditing ? (
                                                <Button size="sm" onClick={() => setEditingRowId(null)}>
                                                    Sauvegarder
                                                </Button>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Ouvrir le menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setEditingRowId(tariff.id)}>
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(tariff.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Aucun tarif défini pour ce service.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
