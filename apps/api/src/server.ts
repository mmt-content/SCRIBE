import cors from "cors";
import express from "express";
import multer from "multer";
import { createCategoryDefinitionFromSop, defaultCategories, GoogleGeminiService, InMemoryCategoryStore } from "@hotel-research/core";
import type { ResearchJobListItem, ResearchRequest, ResearchResult } from "@hotel-research/core";
import { extractSopText } from "./sop/extractSopText";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const categoryStore = new InMemoryCategoryStore();
const jobs = new Map<string, ResearchJobListItem>();
const results = new Map<string, ResearchResult>();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/categories", async (req, res) => {
  const mode = req.query.mode as ResearchRequest["mode"] | undefined;
  res.json(await categoryStore.list(mode));
});

app.post("/categories", async (req, res) => {
  const category = await categoryStore.save(req.body);
  res.status(201).json(category);
});

app.post("/categories/from-sop", upload.single("sop"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "SOP file is required." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
      return;
    }

    const sopText = await extractSopText(req.file);
    const gemini = new GoogleGeminiService(apiKey);
    const category = await createCategoryDefinitionFromSop(
      sopText,
      gemini,
      req.body.preferredMode
    );

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

app.post("/research", async (req, res) => {
  const body = req.body as ResearchRequest;
  const processId = String(Date.now());
  const isBatch = body.hotelNames.length > 1;
  const firstHotel = body.hotelNames[0] ?? "Untitled hotel";

  jobs.set(processId, {
    processId,
    userId: body.userId,
    hotelOrBatchName: isBatch ? `Hotel Batch ${jobs.size + 1} - ${firstHotel}` : firstHotel,
    type: isBatch ? "batch" : "single_hotel",
    status: "in_progress",
    hotelOrBatchId: isBatch ? `BATCH_${processId}` : processId,
    timestamp: new Date().toISOString()
  });

  res.status(202).json({ processId, status: "in_progress" });

  // The durable queue/worker belongs here. Keep this async boundary separate from HTTP.
});

app.get("/research/status/:status", (req, res) => {
  const status = normalizeStatus(req.params.status);
  const items = [...jobs.values()].filter((job) => job.status === status);
  res.json({ count: items.length, items });
});

app.get("/research/:processId", (req, res) => {
  const result = results.get(req.params.processId);
  if (!result) {
    res.status(404).json({ error: "Research result not found." });
    return;
  }

  res.json(result);
});

app.get("/defaults/categories", (_req, res) => {
  res.json(defaultCategories);
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  res.status(500).json({ error: message });
});

function normalizeStatus(status: string): ResearchJobListItem["status"] {
  if (status === "completed" || status === "finished") return "finished";
  if (status === "failed") return "failed";
  return "in_progress";
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`Hotel Research API listening on http://localhost:${port}`);
});
