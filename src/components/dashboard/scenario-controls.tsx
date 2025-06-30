
"use client";

import { useMemo, useState, useEffect } from "react";
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
import { useScenarioStore, type AdoptionRates, SERVICES, initialScenarioState, type Scenario, type Service } from "@/hooks/use-scenario-store";
import { Input } from "@/components/ui/input";
import { TrendingUp, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEntityStore } from "@/hooks/use-entity-store";
import { useTariffStore } from "@/hooks/use-tariff-store";
import { useCostStore } from "@/hooks/use-cost-store";
import { getTariffPriceForEntity } from "@/lib/projections";
import { useChartFilterStore } from "@/hooks/use-chart-filter-store";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const serviceColorHsl: Record<Service, string> = {
  GEOTER: "217.2 91.2% 59.8%", // chart-1
  SPANC: "158.1 81.3% 40.2%",  // chart-2
  ROUTE: "48 96% 50%",        // chart-3
  ADS: "260 80% 60%",           // chart-5 is now violet
};

const ParameterSlider = ({
  label,
  value,
  onValueChange,
  valueSuffix = "%",
  color,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  valueSuffix?: string;
  color?: string;
}) => {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <Label style={color ? { color: `hsl(${color})` } : {}}>{label}</Label>
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
        style={color ? { "--primary": color } as React.CSSProperties : {}}
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
    const [roiYear, setRoiYear] = useState(endYear);

    useEffect(() => {
        if (roiYear < startYear || roiYear > endYear) {
            setRoiYear(endYear);
        }
    }, [roiYear, startYear, endYear]);

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
                let serviceBaseRevenue = 0;
                let servicePotentialRevenue = 0;

                // Base revenue from active entities
                entities.filter(e => e.statut === 'Actif').forEach(entity => {
                    const subscription = entity.services.find(s => s.name === service);
                    if (subscription && year >= subscription.year) {
                        const price = getTariffPriceForEntity(entity, service, tariffs);
                        serviceBaseRevenue += price;
                    }
                });

                // Potential revenue from inactive entities
                entities.filter(e => e.statut === 'Inactif').forEach(entity => {
                    const subscription = entity.services.find(s => s.name === service);
                    if (!subscription) {
                        const price = getTariffPriceForEntity(entity, service, tariffs);
                        servicePotentialRevenue += price;
                    }
                });

                const serviceKey = service as keyof AdoptionRates;
                const adoptionRatePercent = scenario.adoptionRates[serviceKey];
                const additionalRevenue = servicePotentialRevenue * (adoptionRatePercent / 100);

                revenue += serviceBaseRevenue + additionalRevenue;
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

        const current = calculateValues(currentScenario, roiYear, selectedService);
        const initial = calculateValues(initialScenario, roiYear, selectedService);
        
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
    }, [scenario, costs, entities, tariffs, startYear, endYear, selectedService, roiYear]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium w-full">
                    <div className="flex w-full items-center justify-between">
                        <span>
                          ROI projeté{roiData.serviceName} ({roiYear})
                        </span>
                        <div className="-mr-2 flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRoiYear((y) => Math.max(startYear, y - 1));
                            }}
                            disabled={roiYear <= startYear}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRoiYear((y) => Math.min(endYear, y + 1));
                            }}
                            disabled={roiYear >= endYear}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                    </div>
                </CardTitle>
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
        <CardTitle>Constructeur de scénarios</CardTitle>
        <CardDescription>
          Ajustez les paramètres pour modéliser différents avenirs financiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" defaultValue={['adoption', 'general']} className="w-full">
          <AccordionItem value="adoption">
            <AccordionTrigger className="py-3 text-sm font-medium">Taux d'adoption par service</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-1">
                {SERVICES.map((service) => (
                  <ParameterSlider
                    key={service}
                    label={service}
                    value={scenario.adoptionRates[service]}
                    onValueChange={(value) => updateAdoptionRate(service, value)}
                    color={serviceColorHsl[service]}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="general">
            <AccordionTrigger className="py-3 text-sm font-medium">Paramètres et période</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Période de projection</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                <ParameterSlider
                  label="Augmentation des tarifs"
                  value={scenario.priceIncrease}
                  onValueChange={(value) => updateScenarioValue('priceIncrease', value)}
                />
                <ParameterSlider
                  label="Taux d'indexation"
                  value={scenario.indexationRate}
                  onValueChange={(value) => updateScenarioValue('indexationRate', value)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sensitivity" className="border-b-0">
             <AccordionTrigger className="py-3 text-sm font-medium">Analyse de sensibilité</AccordionTrigger>
             <AccordionContent>
                 <div className="pt-1">
                    <RoiCard />
                 </div>
             </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex items-center space-x-2 px-1 pt-4">
            <Switch id="autosave-scenario" defaultChecked />
            <Label htmlFor="autosave-scenario" className="font-normal">
                Sauvegarde auto.
            </Label>
        </div>
      </CardContent>
    </Card>
  );
}
