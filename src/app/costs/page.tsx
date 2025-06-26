
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
    { id: "C-01", costItem: "Salaries", category: "Fixed", monthlyCost: 150000, notes: "Includes all staff" },
    { id: "C-02", costItem: "Infrastructure Maintenance", category: "Fixed", monthlyCost: 75000, notes: "Scheduled maintenance" },
    { id: "C-03", costItem: "Fuel", category: "Variable", monthlyCost: 45000, notes: "For vehicle fleet" },
    { id: "C-04", costItem: "Utilities", category: "Variable", monthlyCost: 22000, notes: "Electricity and water" },
    { id: "C-05", costItem: "Software Licenses", category: "Fixed", monthlyCost: 5000, notes: "Annual contracts" },
];

export default function CostsPage() {
  return (
    <div className="flex flex-col h-full">
        <Header 
            title="Operational Costs"
            actions={
                <div className="flex items-center space-x-2">
                     <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Cost
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
                    <CardTitle>Cost Breakdown</CardTitle>
                    <CardDescription>
                        Modify and add operational costs to calculate profitability.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cost Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Monthly Cost (€)</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {costs.map((cost) => (
                                <TableRow key={cost.id}>
                                    <TableCell className="font-medium">{cost.costItem}</TableCell>
                                    <TableCell>
                                        <Badge variant={cost.category === 'Fixed' ? 'secondary' : 'outline'}>{cost.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" defaultValue={cost.monthlyCost.toFixed(2)} />
                                    </TableCell>
                                    <TableCell>
                                        <Input defaultValue={cost.notes} />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">Edit</Button>
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
