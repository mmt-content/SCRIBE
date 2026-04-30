import type { CategoryDefinition, ResearchMode } from "../types";
import { defaultResearchPrompt } from "./defaultResearchPrompt";

export interface PromptBuildInput {
  mode: ResearchMode;
  categories: CategoryDefinition[];
  userPrompt?: string;
}

export function buildResearchPrompt(input: PromptBuildInput) {
  const categoryRules = input.categories
    .map((category) => {
      return [
        `Category: ${category.name}`,
        `Mode: ${category.mode}`,
        `Description: ${category.description}`,
        `Required fields: ${category.requiredResearchFields.join(", ")}`,
        `Output format: ${category.outputFormat}`,
        category.writingStyle ? `Writing style: ${category.writingStyle}` : "",
        `Do: ${category.doRules.join("; ")}`,
        `Don't: ${category.dontRules.join("; ")}`,
        `Evidence: ${category.sourceEvidenceRequirements.join("; ")}`,
        `Missing info: ${category.missingInformationRules.join("; ")}`,
        `JSON schema: ${category.jsonSchemaDescription}`
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return [defaultResearchPrompt, `Selected mode: ${input.mode}`, categoryRules, input.userPrompt ?? ""]
    .filter(Boolean)
    .join("\n\n");
}
