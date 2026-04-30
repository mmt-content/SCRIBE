export type ResearchMode = "mmt_content_mode" | "raw_research_mode";

export type JobStatus = "queued" | "in_progress" | "completed" | "failed";

export type Confidence = "high" | "medium" | "low";

export interface Evidence {
  sourceUrl: string;
  sourceExcerpt: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  mode: ResearchMode;
  description: string;
  requiredResearchFields: string[];
  outputFormat: string;
  writingStyle?: string;
  examples: string[];
  doRules: string[];
  dontRules: string[];
  sourceEvidenceRequirements: string[];
  missingInformationRules: string[];
  jsonSchemaDescription: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface ResearchRequest {
  hotelNames: string[];
  mode: ResearchMode;
  selectedCategoryIds: string[];
  researchPrompt: string;
  userId: string;
}

export interface OfficialWebsiteCandidate {
  hotelName: string;
  url: string;
  confidence: Confidence;
  validationNotes: string[];
}

export interface CrawledPage {
  pageTitle: string;
  url: string;
  extractedText: string;
  discoveredAt: string;
}

export interface ResearchField {
  label: string;
  value: string | "not_found";
  sourceUrl: string;
  sourceExcerpt: string;
  confidence: Confidence;
}

export interface ResearchSection {
  title: string;
  fields: ResearchField[];
}

export interface ContentOutput {
  type: "brown_text" | "experience_card" | "property_description" | "custom";
  title: string;
  copy: string;
  supportingEvidence: Evidence[];
  warnings: string[];
}

export interface ResearchResult {
  hotelName: string;
  officialWebsite: string;
  researchMode: ResearchMode;
  selectedCategories: string[];
  status: "completed" | "in_progress" | "failed";
  summary: {
    shortAnswer: string;
    confidence: Confidence;
    missingInformation: string[];
  };
  sections: ResearchSection[];
  contentOutputs: ContentOutput[];
  rawEvidence: CrawledPage[];
  errors: string[];
}

export interface ResearchJobListItem {
  processId: string;
  userId: string;
  hotelOrBatchName: string;
  type: "single_hotel" | "batch";
  status: "finished" | "in_progress" | "failed";
  hotelOrBatchId: string;
  timestamp: string;
}
