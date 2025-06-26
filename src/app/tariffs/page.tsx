
import { Save, Share2 } from "lucide-react";
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
import type { Tariff } from "@/types";

const tariffs: Tariff[] = [
    { id: "T-01", service: "Gestion de l'eau", category: "Résidentiel", unit: "m³", price: 1.50 },
    { id: "T-02", service: "Gestion de l'eau", category: "Commercial", unit: "m³", price: 2.75 },
    { id: "T-03", service: "Collecte des déchets", category: "Résidentiel", unit: "mois", price: 15.00 },
    { id: "T-04", service: "Collecte des déchets", category: "Commercial", unit: "tonne", price: 120.00 },
    { id: "T-05", service: "Transport Public", category: "Billet Unique", unit: "trajet", price: 2.10 },
    { id: "T-06", service: "Transport Public", category: "Abonnement Mensuel", unit: "mois", price: 55.00 },
];

export default function TariffsPage() {
  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Grille Tarifaire"
            actions={
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager
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
                    <CardTitle>Tarifs des Services</CardTitle>
                    <CardDescription>
                        Modifiez les tarifs par service et par catégorie. Les prix sont en euros.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Unité</TableHead>
                                <TableHead className="w-[150px]">Prix (€)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tariffs.map((tariff) => (
                                <TableRow key={tariff.id}>
                                    <TableCell className="font-medium">{tariff.service}</TableCell>
                                    <TableCell>{tariff.category}</TableCell>
                                    <TableCell>{tariff.unit}</TableCell>
                                    <TableCell>
                                        <Input type="number" defaultValue={tariff.price.toFixed(2)} step="0.01" />
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
