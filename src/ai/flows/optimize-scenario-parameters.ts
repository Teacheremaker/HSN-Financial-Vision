'use server';

/**
 * @fileOverview AI-driven parameter optimization for scenario planning.
 *
 * - optimizeScenarioParameters - A function that suggests optimal parameters for a given KPI.
 * - OptimizeScenarioParametersInput - The input type for the optimizeScenarioParameters function.
 * - OptimizeScenarioParametersOutput - The return type for the optimizeScenarioParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeScenarioParametersInputSchema = z.object({
  kpi: z
    .string()
    .describe('The key performance indicator to optimize (e.g., total revenue, adoption rate).'),
  levers: z
    .string()
    .describe('The levers that can be adjusted to optimize the KPI (e.g., pricing).'),
  constraints: z
    .string()
    .optional()
    .describe('Constraints or limitations on the levers that should be considered.'),
  historicalData: z
    .string()
    .optional()
    .describe('Historical data relevant to the KPI and levers.'),
});
export type OptimizeScenarioParametersInput = z.infer<
  typeof OptimizeScenarioParametersInputSchema
>;

const OptimizeScenarioParametersOutputSchema = z.object({
  suggestedParameters: z
    .string()
    .describe('Suggested optimal parameter values for the specified levers.'),
  rationale: z
    .string()
    .describe('The rationale behind the suggested parameter values.'),
});
export type OptimizeScenarioParametersOutput = z.infer<
  typeof OptimizeScenarioParametersOutputSchema
>;

export async function optimizeScenarioParameters(
  input: OptimizeScenarioParametersInput
): Promise<OptimizeScenarioParametersOutput> {
  return optimizeScenarioParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeScenarioParametersPrompt',
  input: {schema: OptimizeScenarioParametersInputSchema},
  output: {schema: OptimizeScenarioParametersOutputSchema},
  prompt: `You are an expert financial analyst. Your goal is to suggest optimal
parameter values for various levers to maximize a specified key performance
indicator (KPI). Consider any constraints and historical data provided.

KPI to Optimize: {{{kpi}}}
Levers to Adjust: {{{levers}}}
Constraints: {{{constraints}}}
Historical Data: {{{historicalData}}}

Based on this information, suggest optimal parameter values for the levers and
provide a rationale for your suggestions.

Output your suggested parameters and rationale in JSON format:
{ "suggestedParameters": "...", "rationale": "..." }`,
});

const optimizeScenarioParametersFlow = ai.defineFlow(
  {
    name: 'optimizeScenarioParametersFlow',
    inputSchema: OptimizeScenarioParametersInputSchema,
    outputSchema: OptimizeScenarioParametersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
