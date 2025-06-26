
"use client";

import { useState } from "react";
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

const ParameterSlider = ({
  label,
  defaultValue,
  valueSuffix = "%",
}: {
  label: string;
  defaultValue: number;
  valueSuffix?: string;
}) => {
  const [value, setValue] = useState(defaultValue);
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
        onValueChange={(vals) => setValue(vals[0])}
        max={100}
        step={1}
      />
    </div>
  );
};

const ScenarioTab = ({ title }: { title: string }) => (
  <div className="space-y-4">
    <ParameterSlider label="Taux d'Adoption" defaultValue={75} />
    <ParameterSlider label="Augmentation des Tarifs" defaultValue={5} />
    <ParameterSlider label="Taux d'Indexation" defaultValue={2} />
    <div className="flex items-center space-x-2">
      <Switch id={`autosave-${title.toLowerCase()}`} defaultChecked />
      <Label htmlFor={`autosave-${title.toLowerCase()}`}>
        Sauvegarde auto.
      </Label>
    </div>
  </div>
);

export function ScenarioControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Constructeur de Scénarios</CardTitle>
        <CardDescription>
          Ajustez les paramètres pour modéliser différents avenirs financiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="optimistic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="optimistic">Optimiste</TabsTrigger>
            <TabsTrigger value="conservative">Conservateur</TabsTrigger>
            <TabsTrigger value="extension">Extension</TabsTrigger>
          </TabsList>
          <TabsContent value="optimistic" className="pt-4">
            <ScenarioTab title="Optimistic" />
          </TabsContent>
          <TabsContent value="conservative" className="pt-4">
            <ScenarioTab title="Conservative" />
          </TabsContent>
          <TabsContent value="extension" className="pt-4">
            <ScenarioTab title="Extension" />
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
