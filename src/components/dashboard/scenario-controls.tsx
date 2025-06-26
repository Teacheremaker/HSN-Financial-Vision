"use client";

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
import { useScenarioStore, type Scenarios, SERVICES } from "@/hooks/use-scenario-store";
import { Input } from "@/components/ui/input";

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
         <div className="space-y-4">
            <h3 className="text-sm font-medium">Analyse de Sensibilité</h3>
             <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">±10% Changement de Tarif</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-500">+€1.2M</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-muted-foreground">±1 an Décalage d'Adhésion</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-500">-€0.8M</p>
                </Card>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
