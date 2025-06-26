
"use client";

import { ArrowDownRight, ArrowUpRight, DollarSign, Users, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { KpiData } from "@/types";

const kpiData: KpiData[] = [
  {
    name: "Total Revenue",
    value: "€45,231.89",
    change: "+20.1%",
    changeType: "increase",
    icon: DollarSign,
  },
  {
    name: "Adoption Rate",
    value: "75%",
    change: "+12.2%",
    changeType: "increase",
    icon: Users,
  },
  {
    name: "Projected ROI",
    value: "15.3%",
    change: "+5.1%",
    changeType: "increase",
    icon: TrendingUp,
  },
  {
    name: "Operational Cost",
    value: "€8,750.00",
    change: "-2.5%",
    changeType: "decrease",
    icon: ArrowDownRight,
  },
];

const KpiCard = ({ kpi }: { kpi: KpiData }) => {
  const ChangeIcon = kpi.changeType === 'increase' ? ArrowUpRight : ArrowDownRight;
  const changeColor = kpi.changeType === 'increase' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
        <kpi.icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{kpi.value}</div>
        <p className={`text-xs ${changeColor} flex items-center`}>
          <ChangeIcon className="h-3 w-3 mr-1" />
          {kpi.change} from last month
        </p>
      </CardContent>
    </Card>
  );
};


export function KpiCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => (
                <KpiCard key={kpi.name} kpi={kpi} />
            ))}
        </div>
    )
}
