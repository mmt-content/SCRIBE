import * as cheerio from "cheerio";
import type { CrawledPage } from "../types";

export interface CrawlerOptions {
  maxPages: number;
  maxDepth: number;
}

export interface PageFetcher {
  fetch(url: string): Promise<string>;
}

export class FetchPageFetcher implements PageFetcher {
  async fetch(url: string) {
    const response = await fetch(url, {
      headers: {
        "user-agent": "HotelResearchTool/0.1 official-website-research"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return response.text();
  }
}

export function extractVisibleText(html: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  return $("body")
    .text()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function extractInternalLinks(baseUrl: string, html: string) {
  const base = new URL(baseUrl);
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    try {
      const url = new URL(href, base);
      url.hash = "";
      if (url.origin === base.origin) {
        links.add(url.toString());
      }
    } catch {
      // Ignore malformed website links.
    }
  });

  return [...links];
}

export async function crawlOfficialWebsite(rootUrl: string, fetcher: PageFetcher, options: CrawlerOptions) {
  const queue: Array<{ url: string; depth: number }> = [{ url: rootUrl, depth: 0 }];
  const visited = new Set<string>();
  const pages: CrawledPage[] = [];

  while (queue.length && pages.length < options.maxPages) {
    const next = queue.shift();
    if (!next || visited.has(next.url) || next.depth > options.maxDepth) continue;
    visited.add(next.url);

    const html = await fetcher.fetch(next.url);
    const $ = cheerio.load(html);
    const pageTitle = $("title").first().text().trim() || next.url;
    const extractedText = extractVisibleText(html);

    pages.push({
      pageTitle,
      url: next.url,
      extractedText,
      discoveredAt: new Date().toISOString()
    });

    for (const link of extractInternalLinks(next.url, html)) {
      if (!visited.has(link)) queue.push({ url: link, depth: next.depth + 1 });
    }
  }

  return pages;
}
