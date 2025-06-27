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
import axios from 'axios';

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

const optimizeScenarioParametersFlow = ai.defineFlow(
  {
    name: 'optimizeScenarioParametersFlow',
    inputSchema: OptimizeScenarioParametersInputSchema,
    outputSchema: OptimizeScenarioParametersOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === "votre_clé_api_deepseek") {
      throw new Error('La clé API DeepSeek (DEEPSEEK_API_KEY) n\'est pas configurée dans le fichier .env.');
    }

    const systemPrompt = `Vous êtes un analyste financier expert. Votre objectif est de suggérer des valeurs de paramètres optimales pour divers leviers afin de maximiser un indicateur de performance clé (KPI) spécifié. Prenez en compte toutes les contraintes et les données historiques fournies.
Affichez vos paramètres suggérés et votre justification au format JSON valide:
{ "suggestedParameters": "...", "rationale": "..." }
Assurez-vous que la sortie est uniquement le JSON, sans texte ou formatage supplémentaire.`;

    const userPrompt = `
KPI à optimiser: ${input.kpi}
Leviers à ajuster: ${input.levers}
${input.constraints ? `Contraintes: ${input.constraints}` : ''}
${input.historicalData ? `Données historiques: ${input.historicalData}` : ''}
`;

    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('La réponse de l\'API DeepSeek est vide ou malformée.');
      }
      
      const parsedContent = JSON.parse(content);
      const validationResult = OptimizeScenarioParametersOutputSchema.safeParse(parsedContent);

      if (!validationResult.success) {
        console.error("Erreur de validation Zod:", validationResult.error);
        throw new Error("La réponse de l'API DeepSeek ne correspond pas au format attendu.");
      }

      return validationResult.data;

    } catch (error: any) {
      console.error('Erreur lors de l\'appel à l\'API DeepSeek:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new Error('La clé API DeepSeek est invalide ou a expiré.');
      }
      throw new Error('Une erreur est survenue lors de la communication avec l\'IA DeepSeek.');
    }
  }
);
