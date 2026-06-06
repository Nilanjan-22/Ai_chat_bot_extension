import { buildFallbackAnswer, buildPrompt } from "./promptBuilder.js";
import { buildAllowedDomains, shouldUseWebSearch } from "./webSearch.js";

function getApiBaseUrl() {
  return (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
}

function getRequestHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
  };

  if (process.env.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }

  if (process.env.OPENROUTER_APP_TITLE) {
    headers["X-OpenRouter-Title"] = process.env.OPENROUTER_APP_TITLE;
  }

  return headers;
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (Array.isArray(payload?.output)) {
    const textParts = [];

    for (const item of payload.output) {
      if (!Array.isArray(item?.content)) {
        continue;
      }

      for (const content of item.content) {
        if (content?.type === "output_text" && typeof content.text === "string") {
          textParts.push(content.text);
        }
      }
    }

    if (textParts.length) {
      return textParts.join("\n").trim();
    }
  }

  return "";
}

function extractAnnotations(payload) {
  const annotations = [];

  if (!Array.isArray(payload?.output)) {
    return annotations;
  }

  for (const item of payload.output) {
    if (!Array.isArray(item?.content)) {
      continue;
    }

    for (const content of item.content) {
      if (!Array.isArray(content?.annotations)) {
        continue;
      }

      for (const annotation of content.annotations) {
        if (annotation?.type === "url_citation" && annotation?.url) {
          annotations.push({
            type: annotation.type,
            url: annotation.url,
            title: annotation.title || ""
          });
        }
      }
    }
  }

  return annotations;
}

function uniqueSources(sources) {
  const seen = new Set();
  const result = [];

  for (const source of sources) {
    if (!source?.url || seen.has(source.url)) {
      continue;
    }

    seen.add(source.url);
    result.push(source);
  }

  return result;
}

async function callOpenAI(prompt, options = {}) {
  const body = {
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: prompt
  };

  if (options.useWebSearch) {
    body.tools = [
      {
        type: "openrouter:web_search",
        parameters: {
          max_results: 4,
          search_context_size: "medium",
          allowed_domains: options.allowedDomains
        }
      }
    ];
  }

  const response = await fetch(`${getApiBaseUrl()}/responses`, {
    method: "POST",
    headers: getRequestHeaders(),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const answer = extractOutputText(payload);

  if (!answer) {
    throw new Error("OpenAI response did not contain any text output.");
  }

  return {
    answer,
    annotations: extractAnnotations(payload),
    usage: payload?.usage ?? null
  };
}

export async function generateAssistantAnswer({
  question,
  language,
  pageContext,
  guide,
  useWebSearch = false
}) {
  const prompt = buildPrompt({ question, language, pageContext, guide });
  const guideSources = guide?.sources ?? [];
  const allowedDomains = buildAllowedDomains({ pageContext, guide });
  const enableWebSearch = shouldUseWebSearch({ useWebSearch, guide });

  if (!process.env.OPENAI_API_KEY) {
    return {
      answer: buildFallbackAnswer({ question, language, pageContext, guide }),
      mode: "fallback",
      sources: guideSources,
      webSearchUsed: false
    };
  }

  try {
    const result = await callOpenAI(prompt, {
      useWebSearch: enableWebSearch,
      allowedDomains
    });

    return {
      answer: result.answer,
      mode: "model",
      sources: uniqueSources([...guideSources, ...result.annotations]),
      webSearchUsed: Boolean(result?.usage?.server_tool_use?.web_search_requests),
      webSearchRequests: result?.usage?.server_tool_use?.web_search_requests ?? 0
    };
  } catch (error) {
    return {
      answer: buildFallbackAnswer({ question, language, pageContext, guide }),
      mode: "fallback",
      sources: guideSources,
      webSearchUsed: false,
      warning: error.message
    };
  }
}
