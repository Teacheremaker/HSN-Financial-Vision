
"use server";

import {
  optimizeScenarioParameters,
  OptimizeScenarioParametersInput,
} from "@/ai/flows/optimize-scenario-parameters";

export async function getOptimizedParameters(
  input: OptimizeScenarioParametersInput
) {
  try {
    const result = await optimizeScenarioParameters(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}
