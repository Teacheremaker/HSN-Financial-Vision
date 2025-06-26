
'use client';

import { useState, useEffect } from 'react';
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
  TableFooter,
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initialCosts } from '@/data/costs';

const services = ["GEOTER", "SPANC", "ROUTE", "ADS", "Global"];

export default function CostsPage() {
    const { toast } = useToast();
    const [costs, setCosts] = useState<OperationalCost[]>(initialCosts);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('GEOTER');

    useEffect(() => {
        try {
            const savedCosts = localStorage.getItem('hsn-operational-costs');
            if (savedCosts) {
                setCosts(JSON.parse(savedCosts));
            }
        } catch (error) {
            console.error("Failed to parse costs from localStorage", error);
        }
    }, []);

    const handleSaveChanges = () => {
        try {
            localStorage.setItem('hsn-operational-costs', JSON.stringify(costs));
            toast({
                title: "Sauvegarde réussie",
                description: "Les coûts opérationnels ont été sauvegardés localement.",
            });
        } catch (error) {
            console.error("Failed to save costs to localStorage", error);
            toast({
                variant: "destructive",
                title: "Erreur de sauvegarde",
                description: "Impossible de sauvegarder les modifications.",
            });
        }
    };

    const handleUpdate = (id: string, field: keyof OperationalCost, value: any) => {
        setCosts(currentCosts => {
            let updatedCosts = currentCosts.map(cost =>
                cost.id === id ? { ...cost, [field]: value } : cost
            );

            const changedCost = updatedCosts.find(c => c.id === id);
            
            if (changedCost?.category === 'À amortir') {
                const investmentCost = changedCost;
                const amortizationLine = updatedCosts.find(c => c.service === investmentCost.service && c.category === 'Amortissement');

                if (amortizationLine) {
                    const amountToAmortize = investmentCost.annualCost;
                    const duration = investmentCost.amortizationDuration;
                    
                    if (amountToAmortize > 0 && duration && duration > 0) {
                        const calculatedAmortization = amountToAmortize / duration;
                        updatedCosts = updatedCosts.map(cost => {
                            if (cost.id === amortizationLine.id) {
                                return { 
                                    ...cost, 
                                    annualCost: calculatedAmortization,
                                    amortizationStartYear: investmentCost.amortizationStartYear,
                                    amortizationDuration: investmentCost.amortizationDuration,
                                };
                            }
                            return cost;
                        });
                    }
                }
            }
            
            return updatedCosts;
        });
    };

    const handleAddNew = () => {
        const newId = `C-${String(Date.now()).slice(-5)}`;
        const newCost: OperationalCost = {
            id: newId,
            service: activeTab,
            costItem: "Nouveau coût",
            category: "Variable",
            annualCost: 0,
            notes: "",
        };
        setCosts(currentCosts => [...currentCosts, newCost]);
        setEditingRowId(newId);
    };

    const handleDelete = (id: string) => {
        setCosts(currentCosts => currentCosts.filter(cost => cost.id !== id));
    };
    
    const filteredCosts = costs.filter(cost => cost.service === activeTab);
    const totalAnnualCost = filteredCosts
        .filter(cost => cost.category !== 'À amortir')
        .reduce((sum, cost) => sum + (cost.annualCost || 0), 0);

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
                    <Button onClick={handleSaveChanges}>
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
                                    <TableHead className="w-[30%]">Élément de Coût</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead>Coût Annuel (€)</TableHead>
                                    <TableHead>Amortissement</TableHead>
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
                                                        <SelectItem value="Amortissement">Amortissement</SelectItem>
                                                        <SelectItem value="À amortir">À amortir</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={cost.category === 'À amortir' ? 'default' : (cost.category === 'Variable' ? 'outline' : 'secondary')}>
                                                    {cost.category}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isEditing ? (
                                                <Input 
                                                    type="number" 
                                                    value={cost.annualCost} 
                                                    onChange={(e) => handleUpdate(cost.id, 'annualCost', parseFloat(e.target.value) || 0)}
                                                    className="h-8 text-right"
                                                    disabled={cost.category === 'Amortissement'}
                                                    title={cost.category === 'Amortissement' ? "Ce champ est calculé automatiquement" : ""}
                                                />
                                            ) : (
                                                cost.annualCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing && cost.category === 'À amortir' ? (
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <Label htmlFor={`start-year-${cost.id}`} className="sr-only">Année de début</Label>
                                                        <Input 
                                                            id={`start-year-${cost.id}`}
                                                            type="number"
                                                            placeholder="Année"
                                                            value={cost.amortizationStartYear ?? ''}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value, 10);
                                                                handleUpdate(cost.id, 'amortizationStartYear', isNaN(value) ? undefined : value);
                                                            }}
                                                            className="h-8 w-20"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`duration-${cost.id}`} className="sr-only">Durée en années</Label>
                                                        <Input
                                                            id={`duration-${cost.id}`}
                                                            type="number"
                                                            placeholder="Durée (ans)"
                                                            value={cost.amortizationDuration ?? ''}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value, 10);
                                                                handleUpdate(cost.id, 'amortizationDuration', isNaN(value) ? undefined : value);
                                                            }}
                                                            className="h-8 w-20"
                                                        />
                                                     </div>
                                                </div>
                                            ) : cost.amortizationStartYear ? (
                                                `${cost.amortizationStartYear} (${cost.amortizationDuration} ans)`
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
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
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Aucun coût défini pour ce service.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-muted/50 font-medium">
                                    <TableCell colSpan={2}>Total Charges d'Exploitation {activeTab !== 'Global' ? activeTab : 'Mutualisées'}</TableCell>
                                    <TableCell className="text-right">{totalAnnualCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell colSpan={3}></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
