
import { PlusCircle, Save } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { OperationalCost } from "@/types";

const costs: OperationalCost[] = [
    { id: "C-01", costItem: "Salaires", category: "Fixe", monthlyCost: 150000, notes: "Inclut tout le personnel" },
    { id: "C-02", costItem: "Maintenance de l'infrastructure", category: "Fixe", monthlyCost: 75000, notes: "Maintenance planifiée" },
    { id: "C-03", costItem: "Carburant", category: "Variable", monthlyCost: 45000, notes: "Pour la flotte de véhicules" },
    { id: "C-04", costItem: "Services Publics", category: "Variable", monthlyCost: 22000, notes: "Électricité et eau" },
    { id: "C-05", costItem: "Licences logicielles", category: "Fixe", monthlyCost: 5000, notes: "Contrats annuels" },
];

export default function CostsPage() {
  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Coûts Opérationnels"
            actions={
                <div className="flex items-center space-x-2">
                     <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un Coût
                    </Button>
                    <Button>
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder
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
                            {costs.map((cost) => (
                                <TableRow key={cost.id}>
                                    <TableCell className="font-medium">{cost.costItem}</TableCell>
                                    <TableCell>
                                        <Badge variant={cost.category === 'Fixe' ? 'secondary' : 'outline'}>{cost.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" defaultValue={cost.monthlyCost.toFixed(2)} />
                                    </TableCell>
                                    <TableCell>
                                        <Input defaultValue={cost.notes} />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">Modifier</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
