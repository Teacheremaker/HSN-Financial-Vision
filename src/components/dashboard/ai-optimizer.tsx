
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
  kpi: z.string().min(3, "KPI must be at least 3 characters."),
  levers: z.string().min(3, "Levers must be at least 3 characters."),
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
      kpi: "Total Revenue",
      levers: "Pricing, adoption timeline",
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
        title: "Optimization Complete",
        description: "AI has provided suggestions.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Optimization Failed",
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
              <span>AI-Driven Optimization</span>
            </CardTitle>
            <CardDescription>
              Let AI suggest optimal parameters to maximize your chosen KPI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="kpi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI to Optimize</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Total Revenue" {...field} />
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
                  <FormLabel>Levers to Adjust</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pricing, marketing spend" {...field} />
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
                  <FormLabel>Constraints (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Budget cannot exceed €50k" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {result && (
              <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base">AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div>
                    <h4 className="font-semibold">Suggested Parameters:</h4>
                    <p className="text-muted-foreground">{result.suggestedParameters}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Rationale:</h4>
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
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Optimization
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
