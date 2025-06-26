
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
import type { OperationalCost } from "@/types";

const initialCosts: OperationalCost[] = [
    { id: "C-01", costItem: "Salaires", category: "Fixe", monthlyCost: 150000, notes: "Inclut tout le personnel" },
    { id: "C-02", costItem: "Maintenance de l'infrastructure", category: "Fixe", monthlyCost: 75000, notes: "Maintenance planifiée" },
    { id: "C-03", costItem: "Carburant", category: "Variable", monthlyCost: 45000, notes: "Pour la flotte de véhicules" },
    { id: "C-04", costItem: "Services Publics", category: "Variable", monthlyCost: 22000, notes: "Électricité et eau" },
    { id: "C-05", costItem: "Licences logicielles", category: "Fixe", monthlyCost: 5000, notes: "Contrats annuels" },
];

export default function CostsPage() {
    const [costs, setCosts] = useState(initialCosts);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);

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
                    <CardTitle>Détail des Coûts</CardTitle>
                    <CardDescription>
                        Modifiez et ajoutez des coûts opérationnels pour calculer la rentabilité.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                            {costs.map((cost) => {
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
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
