
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
    { id: "T-01", service: "Water Management", category: "Residential", unit: "m³", price: 1.50 },
    { id: "T-02", service: "Water Management", category: "Commercial", unit: "m³", price: 2.75 },
    { id: "T-03", service: "Waste Collection", category: "Residential", unit: "month", price: 15.00 },
    { id: "T-04", service: "Waste Collection", category: "Commercial", unit: "ton", price: 120.00 },
    { id: "T-05", service: "Public Transport", category: "Single Ticket", unit: "trip", price: 2.10 },
    { id: "T-06", service: "Public Transport", category: "Monthly Pass", unit: "month", price: 55.00 },
];

export default function TariffsPage() {
  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Tariff Grid"
            actions={
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            }
        />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
            <Card>
                <CardHeader>
                    <CardTitle>Service Tariffs</CardTitle>
                    <CardDescription>
                        Modify tariffs by service and category. Prices are in Euros.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead className="w-[150px]">Price (€)</TableHead>
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
