
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
import { Label } from '@/components/ui/label';

const initialTariffs: Tariff[] = [
    // GEOTER
    { id: 'T-G-01', service: 'GEOTER', category: 'Communes 0 à 250', populationMin: 0, populationMax: 250, priceUser: 150, discountFounder: 0 },
    { id: 'T-G-02', service: 'GEOTER', category: 'Communes 251 à 500', populationMin: 251, populationMax: 500, priceUser: 450, discountFounder: 0 },
    { id: 'T-G-03', service: 'GEOTER', category: 'Communes 501 à 750', populationMin: 501, populationMax: 750, priceUser: 550, discountFounder: 0 },
    { id: 'T-G-04', service: 'GEOTER', category: 'Communes 751 à 1000', populationMin: 751, populationMax: 1000, priceUser: 700, discountFounder: 0 },
    { id: 'T-G-05', service: 'GEOTER', category: 'Communes 1001 à 3000', populationMin: 1001, populationMax: 3000, priceUser: 750, discountFounder: 0 },
    { id: 'T-G-06', service: 'GEOTER', category: 'Communes Supérieur à 3000', populationMin: 3001, populationMax: 20000, priceUser: 1800, discountFounder: 0 },
    { id: 'T-G-07', service: 'GEOTER', category: 'syndicats ≤ 4 000 habitants', populationMin: 1, populationMax: 4000, priceUser: 700, discountFounder: 0 },
    { id: 'T-G-08', service: 'GEOTER', category: 'syndicats de 4 001 à 10 000 habitants', populationMin: 4001, populationMax: 10000, priceUser: 180, discountFounder: 0 },
    { id: 'T-G-09', service: 'GEOTER', category: 'syndicats > 10 000 habitants', populationMin: 10001, populationMax: 20000, priceUser: 4000, discountFounder: 0 },
    { id: 'T-G-10', service: 'GEOTER', category: 'syndicats > 20 000 habitants', populationMin: 20001, populationMax: 40000, priceUser: 5000, discountFounder: 0 },
    { id: 'T-G-11', service: 'GEOTER', category: 'Autre (SDSIS, OPH, ingenieurie70)', priceFounder: 5000, priceUser: 5000, notes: 'à définir' },
    { id: 'T-G-12', service: 'GEOTER', category: 'Communauté de communes < 10 000 habitants', populationMin: 1, populationMax: 10000, priceFounder: 1000, priceUser: 1000, discountFounder: 100 },
    { id: 'T-G-13', service: 'GEOTER', category: 'Communauté de communes de 10 001 à 20 000 habitants', populationMin: 10001, populationMax: 20000, priceFounder: 1800, priceUser: 1800, discountFounder: 100 },
    { id: 'T-G-14', service: 'GEOTER', category: 'Communauté de communes > 20 000 habitants', populationMin: 20001, populationMax: 100000, priceFounder: 2500, priceUser: 2500, discountFounder: 100 },
    { id: 'T-G-15', service: 'GEOTER', category: 'Communauté d\'agglo', populationMin: 0, populationMax: 100000, priceFounder: 5000, priceUser: 5000, discountFounder: 0 },
    { id: 'T-G-16', service: 'GEOTER', category: 'Département', populationMin: 0, populationMax: 300000, priceFounder: 5000, priceUser: 5000, discountFounder: 100 },

    // SPANC
    { id: 'T-S-01', service: 'SPANC', category: 'Communes 0 à 250', populationMin: 0, populationMax: 250, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-02', service: 'SPANC', category: 'Communes 251 à 500', populationMin: 251, populationMax: 500, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-03', service: 'SPANC', category: 'Communes 501 à 750', populationMin: 501, populationMax: 750, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-04', service: 'SPANC', category: 'Communes 751 à 1000', populationMin: 751, populationMax: 1000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-05', service: 'SPANC', category: 'Communes 1001 à 3000', populationMin: 1001, populationMax: 3000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-06', service: 'SPANC', category: 'Communes Supérieur à 3000', populationMin: 3001, populationMax: 20000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-07', service: 'SPANC', category: 'syndicats ≤ 4 000 habitants', populationMin: 1, populationMax: 4000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-08', service: 'SPANC', category: 'syndicats de 4 001 à 10 000 habitants', populationMin: 4001, populationMax: 10000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-09', service: 'SPANC', category: 'syndicats > à 10 000 habitants', populationMin: 10001, populationMax: 20000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-10', service: 'SPANC', category: 'syndicats > à 20 000 habitants', populationMin: 20001, populationMax: 40000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-11', service: 'SPANC', category: 'Autre (SDSIS, OPH, ingenieurie70)', priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-12', service: 'SPANC', category: 'Communauté de communes < 10 000 habitants', populationMin: 1, populationMax: 10000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-13', service: 'SPANC', category: 'Communauté de communes de 10 001 à 20 000 habitants', populationMin: 10001, populationMax: 20000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-14', service: 'SPANC', category: 'Communauté de communes > 20 000 habitants', populationMin: 20001, populationMax: 100000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-15', service: 'SPANC', category: 'Communauté d\'agglo', populationMin: 0, populationMax: 100000, priceFounder: 850, priceUser: 1200 },
    { id: 'T-S-16', service: 'SPANC', category: 'Département', populationMin: 0, populationMax: 300000, priceFounder: 850, priceUser: 1200 },
];

const services = ["GEOTER", "SPANC", "ROUTE", "ADS"];

export default function TariffsPage() {
    const [tariffs, setTariffs] = useState(initialTariffs);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(services[0] ?? "");

    const handleUpdate = (id: string, field: keyof Tariff, value: any) => {
        setTariffs(currentTariffs =>
            currentTariffs.map(tariff =>
                tariff.id === id ? { ...tariff, [field]: value } : tariff
            )
        );
    };

    const handleAddNew = () => {
        const newId = `T-${String(Date.now()).slice(-5)}`;
        const newTariff: Tariff = {
            id: newId,
            service: activeTab,
            category: "Nouvelle strate/catégorie",
        };
        setTariffs(currentTariffs => [...currentTariffs, newTariff]);
        setEditingRowId(newId);
    };

    const handleDelete = (id: string) => {
        setTariffs(currentTariffs => currentTariffs.filter(tariff => tariff.id !== id));
    };

    const filteredTariffs = tariffs.filter(tariff => tariff.service === activeTab);

    const renderPrice = (price?: number) => price?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? <span className="text-muted-foreground">-</span>;
    const renderPopulation = (tariff: Tariff) => {
        if (tariff.populationMin !== undefined && tariff.populationMax !== undefined) {
            return `${tariff.populationMin.toLocaleString('fr-FR')} - ${tariff.populationMax.toLocaleString('fr-FR')}`;
        }
        return <span className="text-muted-foreground">-</span>;
    }

  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Grille Tarifaire Détaillée"
            actions={
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un tarif
                    </Button>
                    <Button onClick={() => alert('Sauvegarde globale à implémenter')}>
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder les modifications
                    </Button>
                </div>
            }
        />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
            <Card>
                <CardHeader>
                    <CardTitle>Tarifs des Services</CardTitle>
                    <CardDescription>
                        Naviguez entre les services pour voir et modifier les grilles tarifaires. Les prix sont en euros HT.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => { setEditingRowId(null); setActiveTab(value); }} className="w-full">
                        <TabsList>
                            {services.map((service) => (
                                <TabsTrigger key={service} value={service}>
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
                                    <TableHead className="text-right">Prix Fondateur (€)</TableHead>
                                    <TableHead className="text-right">Prix Utilisateur (€)</TableHead>
                                    <TableHead className="text-right">Remise Fond. (%)</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTariffs.length > 0 ? filteredTariffs.map((tariff) => {
                                    const isEditing = editingRowId === tariff.id;
                                    return (
                                    <TableRow key={tariff.id}>
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
