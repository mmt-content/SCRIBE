export const defaultResearchPrompt = `Research official hotel website pages only.

Extract information exactly as written on the official website. Do not rewrite, paraphrase, infer, synonymize, summarize, or embellish factual source data during extraction.

Return structured JSON only. Every field must include sourceUrl and sourceExcerpt. If a fact is not found on the official website, return "not_found". Ignore third-party OTA sources unless explicitly enabled.`;
