
"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useScenarioStore, type AdoptionRates, SERVICES, initialScenarioState, type Scenario, type Service } from "@/hooks/use-scenario-store";
import { Input } from "@/components/ui/input";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEntityStore } from "@/hooks/use-entity-store";
import { useTariffStore } from "@/hooks/use-tariff-store";
import { useCostStore } from "@/hooks/use-cost-store";
import { getTariffPriceForEntity } from "@/lib/projections";
import { useChartFilterStore } from "@/hooks/use-chart-filter-store";

const ParameterSlider = ({
  label,
  value,
  onValueChange,
  valueSuffix = "%",
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  valueSuffix?: string;
}) => {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span className="text-sm font-medium">
          {value}
          {valueSuffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onValueChange(vals[0])}
        max={100}
        step={1}
      />
    </div>
  );
};

const RoiCard = () => {
    const { scenario, startYear, endYear } = useScenarioStore();
    const { selectedService } = useChartFilterStore();
    const { entities } = useEntityStore();
    const { tariffs } = useTariffStore();
    const { costs } = useCostStore();

    const roiData = useMemo(() => {
        const currentScenario = scenario;
        const initialScenario = initialScenarioState;
        const operationalCosts = costs.filter((c) => c.category !== 'À amortir');

        const calculateValues = (scenario: Scenario, year: number, serviceFilter: string) => {
            let revenue = 0;
            let cost = 0;
            
            // --- Revenue ---
            const priceIncreaseFactor = Math.pow(1 + (scenario.priceIncrease / 100), year > startYear ? year - startYear : 0);
            
            const servicesToCalculate = serviceFilter === 'Tous les services' ? SERVICES : (SERVICES.includes(serviceFilter as any) ? [serviceFilter as Service] : []);

            servicesToCalculate.forEach(service => {
                let baseRevenue = 0;
                let potentialRevenue = 0;

                entities.forEach(entity => {
                    if (entity.statut !== 'Actif') return;
                    const price = getTariffPriceForEntity(entity, service, tariffs);
                    const subscription = entity.services.find(s => s.name === service);
                    if (subscription && year >= subscription.year) {
                        baseRevenue += price;
                    } else if (!subscription) {
                        potentialRevenue += price;
                    }
                });

                const serviceKey = service as keyof AdoptionRates;
                const adoptionRatePercent = scenario.adoptionRates[serviceKey];
                const additionalRevenue = potentialRevenue * (adoptionRatePercent / 100);

                revenue += baseRevenue + additionalRevenue;
            });
            
            revenue *= priceIncreaseFactor;

            // --- Cost ---
            const indexationRate = scenario.indexationRate / 100;
            const numYearsIndexed = year > startYear ? year - startYear : 0;

            const relevantCosts = operationalCosts.filter((c) => {
                if (serviceFilter === 'Tous les services') {
                    return true;
                }
                // For a specific service, include ONLY its direct costs.
                return c.service === serviceFilter;
            });
            
            relevantCosts.forEach((c) => {
                const costInflationFactor = (c.category === 'Fixe' || c.category === 'Variable') ? Math.pow(1 + indexationRate, numYearsIndexed) : 1;
                
                if (c.category === 'Amortissement') {
                    const start = c.amortizationStartYear ?? 0;
                    const duration = c.amortizationDuration ?? 0;
                    if (duration > 0 && year >= start && year < start + duration) {
                        cost += c.annualCost;
                    }
                } else {
                    cost += c.annualCost * costInflationFactor;
                }
            });
            
            return { revenue, cost };
        }

        const current = calculateValues(currentScenario, endYear, selectedService);
        const initial = calculateValues(initialScenario, endYear, selectedService);
        
        const newRoi = current.cost > 0 ? (current.revenue - current.cost) / current.cost * 100 : (current.revenue > 0 ? Infinity : 0);
        const baseRoiValue = initial.cost > 0 ? (initial.revenue - initial.cost) / initial.cost * 100 : (initial.revenue > 0 ? Infinity : 0);

        const roiChange = newRoi - baseRoiValue;
        
        const formatChange = (val: number) => {
            if (!isFinite(val)) return "N/A";
            return `${val >= 0 ? '+' : ''}${val.toFixed(1)} pts`;
        }

        const isGoodChange = newRoi >= baseRoiValue;
        const ChangeIcon = isGoodChange ? ArrowUpRight : ArrowDownRight;
        const changeColor = isGoodChange ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

        const serviceName = selectedService === 'Tous les services' ? '' : ` ${selectedService}`;

        const roiIsPositive = isFinite(newRoi) && newRoi >= 0;
        const valueColor = roiIsPositive ? 'text-green-600 dark:text-green-500' : 'text-orange-500 dark:text-orange-400';


        return {
            value: isFinite(newRoi) ? `${newRoi.toFixed(1)}%` : '∞',
            valueColor,
            change: formatChange(roiChange),
            changeColor,
            ChangeIcon,
            serviceName,
        };
    }, [scenario, costs, entities, tariffs, startYear, endYear, selectedService]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI Projeté{roiData.serviceName} ({endYear})</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${roiData.valueColor}`}>{roiData.value}</div>
                <p className={`text-xs ${roiData.changeColor} flex items-center`}>
                    <roiData.ChangeIcon className="h-3 w-3 mr-1" />
                    {roiData.change} depuis le scénario initial
                </p>
            </CardContent>
        </Card>
    );
};

export function ScenarioControls() {
  const { scenario, updateScenarioValue, updateAdoptionRate, startYear, setStartYear, endYear, setEndYear } = useScenarioStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Constructeur de Scénarios</CardTitle>
        <CardDescription>
          Ajustez les paramètres pour modéliser différents avenirs financiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Période de Projection</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label htmlFor="start-year" className="text-xs text-muted-foreground">Début</Label>
              <Input
                id="start-year"
                type="number"
                value={startYear}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setStartYear(val);
                }}
                min="2020"
                max={endYear - 1}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="end-year" className="text-xs text-muted-foreground">Fin</Label>
              <Input
                id="end-year"
                type="number"
                value={endYear}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setEndYear(val);
                }}
                min={startYear + 1}
                max="2050"
              />
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-4 pt-4">
            <div>
                <Label className="text-sm font-medium">Taux d'Adoption par Service (en plus des entités déjà inscrites)</Label>
                <div className="space-y-4 pt-2">
                    {SERVICES.map((service) => (
                        <ParameterSlider
                            key={service}
                            label={service}
                            value={scenario.adoptionRates[service]}
                            onValueChange={(value) => updateAdoptionRate(service, value)}
                        />
                    ))}
                </div>
            </div>
            <Separator />
            <div>
                <Label className="text-sm font-medium">Paramètres Généraux</Label>
                <div className="space-y-4 pt-2">
                    <ParameterSlider
                        label="Augmentation des Tarifs"
                        value={scenario.priceIncrease}
                        onValueChange={(value) => updateScenarioValue('priceIncrease', value)}
                    />
                    <ParameterSlider
                        label="Taux d'Indexation"
                        value={scenario.indexationRate}
                        onValueChange={(value) => updateScenarioValue('indexationRate', value)}
                    />
                </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-2 pt-2">
                <Switch id="autosave-scenario" defaultChecked />
                <Label htmlFor="autosave-scenario">
                    Sauvegarde auto.
                </Label>
            </div>
        </div>
        <Separator />
         <div className="space-y-2">
            <h3 className="text-sm font-medium">Analyse de Sensibilité</h3>
             <div className="pt-2">
                <RoiCard />
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
