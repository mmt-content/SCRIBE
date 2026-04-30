import type { CategoryStore } from "../categories/categoryStore";
import type { GeminiService } from "../ai/geminiService";
import { buildResearchPrompt } from "../prompts/promptBuilder";
import type { CategoryDefinition, OfficialWebsiteCandidate, ResearchRequest, ResearchResult } from "../types";
import { FetchPageFetcher, crawlOfficialWebsite } from "./crawler";
import { parseAndValidateResearchResult } from "../validation/researchResultValidator";

export interface OfficialWebsiteResolver {
  resolve(hotelName: string): Promise<OfficialWebsiteCandidate>;
}

export class ManualOfficialWebsiteResolver implements OfficialWebsiteResolver {
  async resolve(hotelName: string): Promise<OfficialWebsiteCandidate> {
    throw new Error(`Official website resolver is not configured for ${hotelName}. Add a search provider or manual URL confirmation flow.`);
  }
}

export interface RunResearchDependencies {
  categoryStore: CategoryStore;
  geminiService: GeminiService;
  officialWebsiteResolver: OfficialWebsiteResolver;
  maxCrawlPages: number;
  maxCrawlDepth: number;
}

export async function runResearchForHotel(
  hotelName: string,
  request: ResearchRequest,
  deps: RunResearchDependencies
): Promise<ResearchResult> {
  const categories: CategoryDefinition[] = (
    await Promise.all(request.selectedCategoryIds.map((id) => deps.categoryStore.get(id)))
  ).filter((category): category is CategoryDefinition => Boolean(category));

  const officialWebsite = await deps.officialWebsiteResolver.resolve(hotelName);
  const pages = await crawlOfficialWebsite(officialWebsite.url, new FetchPageFetcher(), {
    maxPages: deps.maxCrawlPages,
    maxDepth: deps.maxCrawlDepth
  });

  const prompt = buildResearchPrompt({
    mode: request.mode,
    categories,
    userPrompt: request.researchPrompt
  });

  const responseText = await deps.geminiService.structureResearch({
    hotelName,
    officialWebsiteUrl: officialWebsite.url,
    mode: request.mode,
    selectedCategories: categories.map((category) => category.name),
    prompt,
    rawEvidence: pages
  });

  return parseAndValidateResearchResult(responseText);
}
