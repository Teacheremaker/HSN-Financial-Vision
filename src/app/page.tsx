
import { Download } from "lucide-react";
import { AiOptimizer } from "@/components/dashboard/ai-optimizer";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { MainChart } from "@/components/dashboard/main-chart";
import { ScenarioControls } from "@/components/dashboard/scenario-controls";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        }
      />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
        <KpiCards />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-7">
          <div className="xl:col-span-4">
            <MainChart />
          </div>
          <div className="xl:col-span-3">
             <ScenarioControls />
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
            <AiOptimizer />
        </div>
      </main>
    </div>
  );
}
