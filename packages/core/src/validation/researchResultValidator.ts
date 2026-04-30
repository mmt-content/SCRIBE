import { z } from "zod";

const confidenceSchema = z.enum(["high", "medium", "low"]);

export const researchResultSchema = z.object({
  hotelName: z.string(),
  officialWebsite: z.string(),
  researchMode: z.enum(["mmt_content_mode", "raw_research_mode"]),
  selectedCategories: z.array(z.string()),
  status: z.enum(["completed", "in_progress", "failed"]),
  summary: z.object({
    shortAnswer: z.string(),
    confidence: confidenceSchema,
    missingInformation: z.array(z.string())
  }),
  sections: z.array(
    z.object({
      title: z.string(),
      fields: z.array(
        z.object({
          label: z.string(),
          value: z.union([z.string(), z.literal("not_found")]),
          sourceUrl: z.string(),
          sourceExcerpt: z.string(),
          confidence: confidenceSchema
        })
      )
    })
  ),
  contentOutputs: z.array(
    z.object({
      type: z.enum(["brown_text", "experience_card", "property_description", "custom"]),
      title: z.string(),
      copy: z.string(),
      supportingEvidence: z.array(
        z.object({
          sourceUrl: z.string(),
          sourceExcerpt: z.string()
        })
      ),
      warnings: z.array(z.string())
    })
  ),
  rawEvidence: z.array(
    z.object({
      pageTitle: z.string(),
      url: z.string(),
      extractedText: z.string(),
      discoveredAt: z.string()
    })
  ),
  errors: z.array(z.string())
});

export function parseAndValidateResearchResult(responseText: string) {
  const parsed = JSON.parse(responseText);
  return researchResultSchema.parse(parsed);
}
