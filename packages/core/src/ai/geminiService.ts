import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CrawledPage, ResearchMode } from "../types";

export interface StructureResearchInput {
  hotelName: string;
  officialWebsiteUrl: string;
  mode: ResearchMode;
  selectedCategories: string[];
  prompt: string;
  rawEvidence: CrawledPage[];
}

export interface GeminiService {
  structureResearch(input: StructureResearchInput): Promise<string>;
  createCategoryFromSop(input: { sopText: string; preferredMode?: ResearchMode }): Promise<string>;
}

export class GoogleGeminiService implements GeminiService {
  private model;

  constructor(apiKey: string, modelName = "gemini-1.5-pro") {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });
  }

  async structureResearch(input: StructureResearchInput) {
    const result = await this.model.generateContent([
      input.prompt,
      "Return JSON only in the required structured schema.",
      JSON.stringify({
        hotelName: input.hotelName,
        officialWebsite: input.officialWebsiteUrl,
        researchMode: input.mode,
        selectedCategories: input.selectedCategories,
        rawEvidence: input.rawEvidence
      })
    ]);

    return result.response.text();
  }

  async createCategoryFromSop(input: { sopText: string; preferredMode?: ResearchMode }) {
    const result = await this.model.generateContent([
      "Convert this SOP into one editable content category definition. Return JSON only.",
      "The output must include category name, mode, description, required research fields, output format, writing style, examples, do rules, don't rules, source evidence requirements, missing information rules, and JSON schema description.",
      input.preferredMode ? `Preferred mode: ${input.preferredMode}` : "",
      input.sopText
    ]);

    return result.response.text();
  }
}
