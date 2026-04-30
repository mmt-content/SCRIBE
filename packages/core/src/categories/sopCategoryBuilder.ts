import type { GeminiService } from "../ai/geminiService";
import type { CategoryDefinition, ResearchMode } from "../types";

export async function createCategoryDefinitionFromSop(
  sopText: string,
  geminiService: GeminiService,
  preferredMode?: ResearchMode
): Promise<CategoryDefinition> {
  const response = await geminiService.createCategoryFromSop({ sopText, preferredMode });
  const category = JSON.parse(response) as CategoryDefinition;

  return {
    ...category,
    id: category.id || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    mode: category.mode || preferredMode || "mmt_content_mode",
    isDefault: false,
    isActive: true
  };
}
