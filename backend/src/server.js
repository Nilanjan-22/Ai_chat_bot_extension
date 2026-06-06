import "dotenv/config";
import cors from "cors";
import express from "express";
import { generateAssistantAnswer } from "./lib/ai.js";
import { findGuideForUrl, loadSiteGuides } from "./lib/siteGuides.js";

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  const guides = await loadSiteGuides();

  res.json({
    ok: true,
    service: "disha",
    guidesLoaded: guides.length
  });
});

app.post("/api/chat", async (req, res) => {
  const { question, language = "en", pageContext = {}, useWebSearch = false } = req.body ?? {};

  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({
      ok: false,
      error: "A non-empty question is required."
    });
  }

  if (!["en", "hi", "bn"].includes(language)) {
    return res.status(400).json({
      ok: false,
      error: "Unsupported language. Use en, hi, or bn."
    });
  }

  try {
    const guide = await findGuideForUrl(pageContext.url);
    const result = await generateAssistantAnswer({
      question: question.trim(),
      language,
      pageContext,
      guide,
      useWebSearch: Boolean(useWebSearch)
    });

    return res.json({
      ok: true,
      answer: result.answer,
      language,
      mode: result.mode,
      warning: result.warning ?? null,
      guide: guide
        ? {
            id: guide.id,
            name: guide.name,
            summary: guide.summary
          }
        : null,
      sources: result.sources,
      webSearchUsed: result.webSearchUsed ?? false,
      webSearchRequests: result.webSearchRequests ?? 0
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown server error"
    });
  }
});

app.listen(port, () => {
  console.log(`Disha backend listening on http://localhost:${port}`);
});
