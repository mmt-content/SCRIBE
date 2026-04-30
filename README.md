# Hotel Research Tool

Web-based hotel research tool for official-website-only extraction, structured Gemini processing, SOP-driven content categories, and batch hotel research.

## Architecture

- `packages/core`: crawling, extraction, Gemini calls, category definitions, prompt building, validation.
- `packages/design`: design tokens and layout constants. Change these to reskin the UI without touching core logic.
- `apps/api`: backend API for research jobs, SOP upload/category creation, and status listings.
- `apps/web`: React frontend that renders the reference UI and consumes structured API responses.

## First Categories

MMT Content Mode:

- Brown Texts
- Experience Cards
- Property Descriptions

Raw Research Mode:

- Amenities
- Room Types & Descriptions
- Dining & Restaurants
- Location & Nearby Attractions
- Hotel Overview / About
- Policies
- Images & Media
- Reviews & Ratings, only if available on the official website
- All Categories

## Setup

```bash
npm install
cp .env.example .env
npm run dev:api
npm run dev
```

The Gemini API key must stay on the backend. Do not call Gemini directly from the browser.

## Current Code Structure

```text
apps/
  api/   Express API routes, SOP upload parsing, status listings
  web/   React UI shell and reference-layout screens
packages/
  core/  Research engine, crawler, Gemini service, prompts, schemas, categories
  design/ Design tokens and UI text constants
```

## Important Implementation Boundaries

- Crawling and exact source extraction live in `packages/core/src/research`.
- Gemini calls live behind `packages/core/src/ai/geminiService.ts`.
- JSON validation lives in `packages/core/src/validation`.
- Default and custom category definitions live in `packages/core/src/categories`.
- Visual constants live in `packages/design`; UI changes should start there or in `apps/web`.

## Next Build Steps

- Add official website search/confirmation flow.
- Add a durable job queue/worker for batch research.
- Persist categories, jobs, and results in a database.
- Wire the web app to the API instead of mock status data.
- Add result details pages for `View Details`.
