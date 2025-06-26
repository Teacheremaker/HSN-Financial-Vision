
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OperationalCost } from "@/types";

const services = ["Global", "GEOTER", "SPANC", "ROUTE", "ADS"];

const initialCosts: OperationalCost[] = [
    // Coûts globaux (mutualisés)
    { id: "C-01", service: "Global", costItem: "Salaires Direction & Admin", category: "Fixe", monthlyCost: 80000, notes: "Personnel non affecté à un service" },
    { id: "C-02", service: "Global", costItem: "Loyer des bureaux", category: "Fixe", monthlyCost: 25000, notes: "Siège social" },
    { id: "C-03", service: "Global", costItem: "Licences logicielles partagées", category: "Fixe", monthlyCost: 3000, notes: "CRM, ERP, etc." },
    { id: "C-04", service: "Global", costItem: "Services Publics (siège)", category: "Variable", monthlyCost: 2200, notes: "Électricité et eau du siège" },
    
    // Coûts par service
    { id: "C-11", service: "GEOTER", costItem: "Salaires équipe GEOTER", category: "Fixe", monthlyCost: 45000, notes: "" },
    { id: "C-12", service: "GEOTER", costItem: "Hébergement serveurs carto", category: "Fixe", monthlyCost: 5000, notes: "Serveurs de cartographie" },
    
    { id: "C-21", service: "SPANC", costItem: "Salaires équipe SPANC", category: "Fixe", monthlyCost: 35000, notes: "" },
    { id: "C-22", service: "SPANC", costItem: "Carburant véhicules inspection", category: "Variable", monthlyCost: 4000, notes: "" },
    
    { id: "C-31", service: "ROUTE", costItem: "Salaires équipe ROUTE", category: "Fixe", monthlyCost: 60000, notes: "" },
    { id: "C-32", service: "ROUTE", costItem: "Matériaux (asphalte, etc.)", category: "Variable", monthlyCost: 20000, notes: "" },
    
    { id: "C-41", service: "ADS", costItem: "Salaires équipe ADS", category: "Fixe", monthlyCost: 25000, notes: "" },
    { id: "C-42", service: "ADS", costItem: "Frais de publication légale", category: "Variable", monthlyCost: 1500, notes: "" },
];


export default function CostsPage() {
    const [costs, setCosts] = useState(initialCosts);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Global');

    const handleUpdate = (id: string, field: keyof OperationalCost, value: string | number) => {
        setCosts(currentCosts =>
            currentCosts.map(cost =>
                cost.id === id ? { ...cost, [field]: value } : cost
            )
        );
    };

    const handleAddNew = () => {
        const newId = `C-${String(Date.now()).slice(-5)}`;
        const newCost: OperationalCost = {
            id: newId,
            service: activeTab,
            costItem: "Nouveau coût",
            category: "Variable",
            monthlyCost: 0,
            notes: "",
        };
        setCosts(currentCosts => [...currentCosts, newCost]);
        setEditingRowId(newId);
    };

    const handleDelete = (id: string) => {
        setCosts(currentCosts => currentCosts.filter(cost => cost.id !== id));
    };
    
    const filteredCosts = costs.filter(cost => cost.service === activeTab);

  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Coûts Opérationnels"
            actions={
                <div className="flex items-center space-x-2">
                     <Button variant="outline" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un Coût
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
                    <CardTitle>Détail des Coûts par Service</CardTitle>
                    <CardDescription>
                        Naviguez entre les services pour voir et modifier les coûts opérationnels associés.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => { setEditingRowId(null); setActiveTab(value); }} className="w-full">
                        <TabsList>
                            {services.map((service) => (
                                <TabsTrigger key={service} value={service}>
                                    {service === 'Global' ? 'Coûts Mutualisés' : service}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="mt-4 rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Élément de Coût</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead>Coût Mensuel (€)</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCosts.length > 0 ? filteredCosts.map((cost) => {
                                    const isEditing = editingRowId === cost.id;
                                    return (
                                    <TableRow key={cost.id}>
                                        <TableCell className="font-medium">
                                            {isEditing ? (
                                                <Input 
                                                    value={cost.costItem} 
                                                    onChange={(e) => handleUpdate(cost.id, 'costItem', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                cost.costItem
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Select value={cost.category} onValueChange={(value) => handleUpdate(cost.id, 'category', value)}>
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue placeholder="Catégorie" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Fixe">Fixe</SelectItem>
                                                        <SelectItem value="Variable">Variable</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={cost.category === 'Fixe' ? 'secondary' : 'outline'}>{cost.category}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input 
                                                    type="number" 
                                                    value={cost.monthlyCost} 
                                                    onChange={(e) => handleUpdate(cost.id, 'monthlyCost', parseFloat(e.target.value) || 0)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                cost.monthlyCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input 
                                                    value={cost.notes} 
                                                    onChange={(e) => handleUpdate(cost.id, 'notes', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                cost.notes
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
                                                        <DropdownMenuItem onClick={() => setEditingRowId(cost.id)}>
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(cost.id)}>
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
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Aucun coût défini pour ce service.
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
