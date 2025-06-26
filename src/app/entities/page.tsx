
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
    { id: "ENT-001", name: "City of Metropolia", status: "Active", services: 3, roi: "+12.5%" },
    { id: "ENT-002", name: "Town of Silverlake", status: "Active", services: 2, roi: "+8.2%" },
    { id: "ENT-003", name: "Village of Oakhaven", status: "Inactive", services: 0, roi: "N/A" },
    { id: "ENT-004", name: "Borough of Ironwood", status: "Active", services: 5, roi: "+21.0%" },
    { id: "ENT-005", name: "Municipality of Sunfield", status: "Inactive", services: 1, roi: "-1.5%" },
];


export default function EntitiesPage() {
  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Entity Management"
            actions={
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Import CSV
                    </Button>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Entity
                    </Button>
                </div>
            }
        />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
            <Card>
                <CardHeader>
                    <CardTitle>Entities</CardTitle>
                    <CardDescription>
                        A list of all entities in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Entity ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
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
                                        <Badge variant={entity.status === 'Active' ? 'default' : 'secondary'} className={entity.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}>
                                            {entity.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{entity.services}</TableCell>
                                    <TableCell>{entity.roi}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">Modify</Button>
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
