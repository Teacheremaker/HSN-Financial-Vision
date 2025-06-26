
import { Download, PlusCircle, Upload } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type { Entity } from "@/types";

const entities: Entity[] = [
    { id: "ENT-001", name: "Ville de Metropolia", status: "Actif", services: 3, roi: "+12.5%" },
    { id: "ENT-002", name: "Ville de Silverlake", status: "Actif", services: 2, roi: "+8.2%" },
    { id: "ENT-003", name: "Village d'Oakhaven", status: "Inactif", services: 0, roi: "N/A" },
    { id: "ENT-004", name: "Arrondissement d'Ironwood", status: "Actif", services: 5, roi: "+21.0%" },
    { id: "ENT-005", name: "Municipalité de Sunfield", status: "Inactif", services: 1, roi: "-1.5%" },
];


export default function EntitiesPage() {
  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Gestion des Entités"
            actions={
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Importer CSV
                    </Button>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter une Entité
                    </Button>
                </div>
            }
        />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
            <Card>
                <CardHeader>
                    <CardTitle>Entités</CardTitle>
                    <CardDescription>
                        Une liste de toutes les entités du système.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Entité</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Services</TableHead>
                                <TableHead>ROI</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entities.map((entity) => (
                                <TableRow key={entity.id}>
                                    <TableCell className="font-medium">{entity.id}</TableCell>
                                    <TableCell>{entity.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={entity.status === 'Actif' ? 'default' : 'secondary'} className={entity.status === 'Actif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}>
                                            {entity.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{entity.services}</TableCell>
                                    <TableCell>{entity.roi}</TableCell>
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
