'use server';

/**
 * @fileOverview Agent IA pour l'optimisation des paramètres de planification de scénarios.
 *
 * - optimizeScenarioParameters - Une fonction qui suggère des paramètres optimaux pour un KPI donné.
 * - OptimizeScenarioParametersInput - Le type d'entrée pour la fonction optimizeScenarioParameters.
 * - OptimizeScenarioParametersOutput - Le type de retour pour la fonction optimizeScenarioParameters.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OptimizeScenarioParametersInputSchema = z.object({
  kpi: z
    .string()
    .describe("L'indicateur de performance clé à optimiser (ex: revenu total, taux d'adoption)."),
  levers: z
    .string()
    .describe("Les leviers qui peuvent être ajustés pour optimiser le KPI (ex: tarification)."),
  constraints: z
    .string()
    .optional()
    .describe('Contraintes ou limitations sur les leviers qui doivent être prises en compte.'),
  historicalData: z
    .string()
    .optional()
    .describe('Données historiques pertinentes pour le KPI et les leviers.'),
});
export type OptimizeScenarioParametersInput = z.infer<
  typeof OptimizeScenarioParametersInputSchema
>;

const OptimizeScenarioParametersOutputSchema = z.object({
  suggestedParameters: z
    .string()
    .describe('Valeurs de paramètres optimales suggérées pour les leviers spécifiés.'),
  rationale: z
    .string()
    .describe('La justification derrière les valeurs de paramètres suggérées.'),
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
    input: { schema: OptimizeScenarioParametersInputSchema },
    output: { schema: OptimizeScenarioParametersOutputSchema },
    prompt: `Vous êtes un analyste financier expert. Votre objectif est de suggérer des valeurs de paramètres optimales pour divers leviers afin de maximiser un indicateur de performance clé (KPI) spécifié. Prenez en compte toutes les contraintes et les données historiques fournies.

    KPI à optimiser: {{{kpi}}}
    Leviers à ajuster: {{{levers}}}
    {{#if constraints}}
    Contraintes: {{{constraints}}}
    {{/if}}
    {{#if historicalData}}
    Données historiques: {{{historicalData}}}
    {{/if}}
    `,
});

const optimizeScenarioParametersFlow = ai.defineFlow(
  {
    name: 'optimizeScenarioParametersFlow',
    inputSchema: OptimizeScenarioParametersInputSchema,
    outputSchema: OptimizeScenarioParametersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("L'IA n'a pas pu générer de suggestion.");
    }
    return output;
  }
);
