
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getOptimizedParameters } from "@/app/actions";
import type { OptimizeScenarioParametersOutput } from "@/ai/flows/optimize-scenario-parameters";

const formSchema = z.object({
  kpi: z.string().min(3, "Le KPI doit contenir au moins 3 caractères."),
  levers: z.string().min(3, "Les leviers doivent contenir au moins 3 caractères."),
  constraints: z.string().optional(),
  historicalData: z.string().optional(),
});

export function AiOptimizer() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizeScenarioParametersOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kpi: "Revenu Total",
      levers: "Tarification, calendrier d'adoption",
      constraints: "",
      historicalData: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const response = await getOptimizedParameters(values);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
      toast({
        title: "Optimisation Terminée",
        description: "L'IA a fourni des suggestions.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Échec de l'Optimisation",
        description: response.error,
      });
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              <span>Optimisation par l'IA</span>
            </CardTitle>
            <CardDescription>
              Laissez l'IA suggérer les paramètres optimaux pour maximiser votre KPI choisi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="kpi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI à Optimiser</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Revenu Total" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="levers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leviers à Ajuster</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Tarification, dépenses marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="constraints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraintes (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ex: Le budget ne peut pas dépasser 50k €" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {result && (
              <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base">Suggestions de l'IA</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div>
                    <h4 className="font-semibold">Paramètres Suggérés :</h4>
                    <p className="text-muted-foreground">{result.suggestedParameters}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Justification :</h4>
                    <p className="text-muted-foreground">{result.rationale}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimisation...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Lancer l'Optimisation
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
