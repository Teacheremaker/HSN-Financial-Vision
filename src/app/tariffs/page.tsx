
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

const initialTariffs: Tariff[] = [
    { id: "T-G01", service: "GEOTER", category: "Droit d'entrée", unit: "forfait", price: 5000.00 },
    { id: "T-G02", service: "GEOTER", category: "Abonnement annuel / habitant", unit: "habitant", price: 1.20 },
    { id: "T-S01", service: "SPANC", category: "Droit d'entrée", unit: "forfait", price: 3000.00 },
    { id: "T-S02", service: "SPANC", category: "Abonnement annuel / habitant", unit: "habitant", price: 0.80 },
    { id: "T-R01", service: "ROUTE", category: "Contribution annuelle", unit: "km de voirie", price: 150.00 },
    { id: "T-A01", service: "ADS", category: "Instruction de dossier", unit: "dossier", price: 100.00 },
    { id: "T-E01", service: "Gestion de l'eau", category: "Résidentiel", unit: "m³", price: 1.50 },
    { id: "T-E02", service: "Gestion de l'eau", category: "Commercial", unit: "m³", price: 2.75 },
    { id: "T-D01", service: "Collecte des déchets", category: "Résidentiel", unit: "mois", price: 15.00 },
    { id: "T-D02", service: "Collecte des déchets", category: "Commercial", unit: "tonne", price: 120.00 },
];

const services = [...new Set(initialTariffs.map(t => t.service))];

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
            category: "Nouvelle catégorie",
            unit: "unité",
            price: 0,
        };
        setTariffs(currentTariffs => [...currentTariffs, newTariff]);
        setEditingRowId(newId);
    };

    const handleDelete = (id: string) => {
        setTariffs(currentTariffs => currentTariffs.filter(tariff => tariff.id !== id));
    };

    const filteredTariffs = tariffs.filter(tariff => tariff.service === activeTab);

  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Grille Tarifaire"
            actions={
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un Tarif
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
                        Naviguez entre les services pour voir et modifier les tarifs. Les prix sont en euros.
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
                                    <TableHead className="w-[40%]">Catégorie</TableHead>
                                    <TableHead>Unité</TableHead>
                                    <TableHead className="text-right w-[150px]">Prix (€)</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTariffs.length > 0 ? filteredTariffs.map((tariff) => {
                                    const isEditing = editingRowId === tariff.id;
                                    return (
                                    <TableRow key={tariff.id}>
                                        <TableCell className="font-medium">
                                            {isEditing ? (
                                                <Input 
                                                    value={tariff.category} 
                                                    onChange={(e) => handleUpdate(tariff.id, 'category', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                tariff.category
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input 
                                                    value={tariff.unit} 
                                                    onChange={(e) => handleUpdate(tariff.id, 'unit', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                tariff.unit
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isEditing ? (
                                                <Input 
                                                    type="number"
                                                    value={tariff.price} 
                                                    onChange={(e) => handleUpdate(tariff.id, 'price', parseFloat(e.target.value) || 0)}
                                                    className="h-8 text-right"
                                                    step="0.01"
                                                />
                                            ) : (
                                                tariff.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            )}
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
                                        <TableCell colSpan={4} className="h-24 text-center">
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
