
'use client';

import { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Save, MoreHorizontal, Trash2, Download } from "lucide-react";
import * as XLSX from 'xlsx';
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
import { useCostStore } from '@/hooks/use-cost-store';
import { useScenarioStore } from '@/hooks/use-scenario-store';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';


const services = ["GEOTER", "SPANC", "ROUTE", "ADS", "Global"];

export default function CostsPage() {
    const { toast } = useToast();
    const { costs, updateCost, addCost, deleteCost } = useCostStore();
    const { scenario, startYear, endYear, updateScenarioValue } = useScenarioStore();
    
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('GEOTER');
    const [selectedYear, setSelectedYear] = useState(startYear);

    useEffect(() => {
        if(selectedYear < startYear || selectedYear > endYear) {
            setSelectedYear(startYear);
        }
    }, [startYear, endYear, selectedYear]);

    const years = useMemo(() => {
        if (startYear > endYear) return [];
        return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    }, [startYear, endYear]);

    const handleSaveChanges = () => {
        toast({
            title: "Modifications enregistrées",
            description: "Les coûts opérationnels et les paramètres de scénario ont été mis à jour.",
        });
    };

    const handleExport = () => {
        const yearsArray = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    
        const dataForExport = costs
            .filter(cost => cost.category !== 'À amortir') // Exclure les lignes d'investissement pur
            .map(cost => {
                const rowData: { [key: string]: string | number } = {
                    'Service': cost.service === 'Global' ? 'Coûts Mutualisés' : cost.service,
                    'Élément de Coût': cost.costItem,
                    'Catégorie': cost.category,
                    'Coût de Base Annuel': cost.annualCost,
                    'Notes': cost.notes || '',
                };
    
                yearsArray.forEach(year => {
                    let projectedCost = cost.annualCost;
                    const indexationFactor = Math.pow(1 + (scenario.indexationRate / 100), year > startYear ? year - startYear : 0);
    
                    if ((cost.category === 'Fixe' || cost.category === 'Variable')) {
                        projectedCost *= indexationFactor;
                    }
                    
                    if (cost.category === 'Amortissement') {
                        const start = cost.amortizationStartYear ?? 0;
                        const duration = cost.amortizationDuration ?? 0;
                        if (duration === 0 || year < start || year >= start + duration) {
                            projectedCost = 0;
                        }
                    }
                    
                    rowData[`Coût Projeté ${year}`] = parseFloat(projectedCost.toFixed(2));
                });
                return rowData;
            });
    
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Coûts Opérationnels');
    
        // Ajuster la largeur des colonnes
        const cols = Object.keys(dataForExport[0] || {}).map(key => ({
             wch: key.includes('Élément de Coût') ? 40 : (key.length < 15 ? 20 : key.length + 5) 
        }));
        worksheet['!cols'] = cols;
    
        XLSX.writeFile(workbook, 'projection_couts_operationnels.xlsx');
    };

    const handleUpdate = (id: string, field: keyof OperationalCost, value: any) => {
        const originalCost = costs.find(c => c.id === id);
        if (!originalCost) return;

        let baseCostValue = value;
        if (field === 'annualCost') {
            const indexationFactor = Math.pow(1 + (scenario.indexationRate / 100), selectedYear > startYear ? selectedYear - startYear : 0);
            if ((originalCost.category === 'Fixe' || originalCost.category === 'Variable') && selectedYear > startYear && indexationFactor > 0) {
                baseCostValue = value / indexationFactor;
            }
        }
        
        updateCost(id, field, baseCostValue);
        const updatedCostData = { ...originalCost, [field]: baseCostValue };
        
        if (updatedCostData.category === 'À amortir') {
             const amortizationLine = costs.find(c => c.service === updatedCostData.service && c.category === 'Amortissement');
             if (amortizationLine) {
                 const amountToAmortize = updatedCostData.annualCost;
                 const duration = updatedCostData.amortizationDuration;
                 if (amountToAmortize > 0 && duration && duration > 0) {
                     const calculatedAmortization = amountToAmortize / duration;
                     updateCost(amortizationLine.id, 'annualCost', calculatedAmortization);
                     updateCost(amortizationLine.id, 'amortizationStartYear', updatedCostData.amortizationStartYear);
                     updateCost(amortizationLine.id, 'amortizationDuration', updatedCostData.amortizationDuration);
                 } else {
                     updateCost(amortizationLine.id, 'annualCost', 0);
                 }
             }
        }
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
        addCost(newCost);
        setEditingRowId(newId);
    };
    
    const displayedCosts = useMemo(() => {
        const indexationFactor = Math.pow(1 + (scenario.indexationRate / 100), selectedYear > startYear ? selectedYear - startYear : 0);
        
        return costs
            .filter(cost => cost.service === activeTab)
            .map(cost => {
                let displayedAnnualCost = cost.annualCost;

                if ((cost.category === 'Fixe' || cost.category === 'Variable')) {
                    displayedAnnualCost *= indexationFactor;
                }
                
                if (cost.category === 'Amortissement') {
                    const start = cost.amortizationStartYear ?? 0;
                    const duration = cost.amortizationDuration ?? 0;
                    if (duration === 0 || selectedYear < start || selectedYear >= start + duration) {
                        displayedAnnualCost = 0;
                    }
                }
                
                return {
                    ...cost,
                    displayedAnnualCost,
                };
            });
    }, [costs, activeTab, selectedYear, scenario.indexationRate, startYear]);


    const totalAnnualCost = displayedCosts
        .filter(cost => cost.category !== 'À amortir')
        .reduce((sum, cost) => sum + (cost.displayedAnnualCost || 0), 0);

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
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
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
                    <CardTitle>Détail des coûts par service</CardTitle>
                    <CardDescription>
                        Naviguez entre les services et les années pour voir les coûts projetés.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                        <div className="grid gap-2 w-full sm:w-auto">
                            <Label htmlFor="year-select">Année d'affichage</Label>
                            <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                                <SelectTrigger id="year-select" className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Choisir une année" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(year => (
                                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 w-full flex-1">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="indexation-slider">Taux d'indexation des coûts</Label>
                                <span className="text-sm font-medium">{scenario.indexationRate}%</span>
                            </div>
                            <Slider
                                id="indexation-slider"
                                value={[scenario.indexationRate]}
                                onValueChange={(vals) => updateScenarioValue('indexationRate', vals[0])}
                                max={20}
                                step={0.5}
                            />
                        </div>
                    </div>
                    <Separator className="mb-6" />

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
                                    <TableHead>Coût Annuel ({selectedYear})</TableHead>
                                    <TableHead>Amortissement</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedCosts.length > 0 ? displayedCosts.map((cost) => {
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
                                                    value={cost.displayedAnnualCost} 
                                                    onChange={(e) => handleUpdate(cost.id, 'annualCost', parseFloat(e.target.value) || 0)}
                                                    className="h-8 text-right"
                                                    disabled={cost.category === 'Amortissement'}
                                                    title={cost.category === 'Amortissement' ? "Ce champ est calculé automatiquement" : ""}
                                                />
                                            ) : (
                                                cost.displayedAnnualCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
                                                        <DropdownMenuItem className="text-destructive" onClick={() => deleteCost(cost.id)}>
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
