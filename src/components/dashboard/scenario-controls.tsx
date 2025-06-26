
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useScenarioStore, type Scenarios, SERVICES, initialScenarioState } from "@/hooks/use-scenario-store";
import { Input } from "@/components/ui/input";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

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

const ScenarioTab = ({ scenarioName }: { scenarioName: keyof Scenarios }) => {
  const { scenarios, updateScenarioValue, updateAdoptionRate } = useScenarioStore();
  const scenario = scenarios[scenarioName];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Taux d'Adoption par Service</Label>
        <div className="space-y-4 pt-2">
            {SERVICES.map((service) => (
                <ParameterSlider
                    key={service}
                    label={service}
                    value={scenario.adoptionRates[service]}
                    onValueChange={(value) => updateAdoptionRate(scenarioName, service, value)}
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
                onValueChange={(value) => updateScenarioValue(scenarioName, 'priceIncrease', value)}
            />
            <ParameterSlider
                label="Taux d'Indexation"
                value={scenario.indexationRate}
                onValueChange={(value) => updateScenarioValue(scenarioName, 'indexationRate', value)}
            />
         </div>
      </div>
      <Separator />
      <div className="flex items-center space-x-2 pt-2">
        <Switch id={`autosave-${scenarioName.toLowerCase()}`} defaultChecked />
        <Label htmlFor={`autosave-${scenarioName.toLowerCase()}`}>
          Sauvegarde auto.
        </Label>
      </div>
    </div>
  );
};

const RoiCard = () => {
    const { scenarios, activeScenario } = useScenarioStore();

    const roiData = useMemo(() => {
        const currentScenario = scenarios[activeScenario];
        const initialScenario = initialScenarioState[activeScenario];

        const currentAdoptionRates = Object.values(currentScenario.adoptionRates);
        const newAdoption = currentAdoptionRates.reduce((a, b) => a + b, 0) / currentAdoptionRates.length;

        const initialAdoptionRates = Object.values(initialScenario.adoptionRates);
        const baseAdoption = initialAdoptionRates.reduce((a, b) => a + b, 0) / initialAdoptionRates.length;
        
        const adoptionFactor = baseAdoption > 0 ? newAdoption / baseAdoption : 1;
        
        const priceFactor = (1 + currentScenario.priceIncrease / 100) / (1 + initialScenario.priceIncrease / 100);
        const indexationFactor = (1 + currentScenario.indexationRate / 100) / (1 + initialScenario.indexationRate / 100);

        const baseRevenue = 45231.89;
        const baseCost = 8750.00;

        const newRevenue = baseRevenue * adoptionFactor * priceFactor;
        const newCost = baseCost * indexationFactor;
        const newRoi = baseCost > 0 ? (newRevenue - newCost) / newCost * 100 : 0;
        const baseRoiValue = baseCost > 0 ? (baseRevenue - baseCost) / baseCost * 100 : 0;

        const roiChange = newRoi - baseRoiValue;
        
        const formatChange = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)} pts`;

        const isGoodChange = newRoi >= baseRoiValue;
        const ChangeIcon = isGoodChange ? ArrowUpRight : ArrowDownRight;
        const changeColor = isGoodChange ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

        return {
            value: `${newRoi.toFixed(1)}%`,
            change: formatChange(roiChange),
            changeColor,
            ChangeIcon,
        };
    }, [scenarios, activeScenario]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI Projeté</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{roiData.value}</div>
                <p className={`text-xs ${roiData.changeColor} flex items-center`}>
                    <roiData.ChangeIcon className="h-3 w-3 mr-1" />
                    {roiData.change} depuis le scénario initial
                </p>
            </CardContent>
        </Card>
    );
};

export function ScenarioControls() {
  const { activeScenario, setActiveScenario, startYear, setStartYear, endYear, setEndYear } = useScenarioStore();

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
        <Tabs
          value={activeScenario}
          onValueChange={(value) => setActiveScenario(value as keyof Scenarios)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="optimistic">Optimiste</TabsTrigger>
            <TabsTrigger value="conservative">Conservateur</TabsTrigger>
            <TabsTrigger value="extension">Extension</TabsTrigger>
          </TabsList>
          <TabsContent value="optimistic" className="pt-4">
            <ScenarioTab scenarioName="optimistic" />
          </TabsContent>
          <TabsContent value="conservative" className="pt-4">
            <ScenarioTab scenarioName="conservative" />
          </TabsContent>
          <TabsContent value="extension" className="pt-4">
            <ScenarioTab scenarioName="extension" />
          </TabsContent>
        </Tabs>
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
