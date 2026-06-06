import { readFile } from "node:fs/promises";
import path from "node:path";

const guidesPath = path.join(process.cwd(), "backend", "data", "site-guides.json");
let cachedGuides = null;

export async function loadSiteGuides() {
  if (cachedGuides) {
    return cachedGuides;
  }

  const raw = await readFile(guidesPath, "utf8");
  cachedGuides = JSON.parse(raw);
  return cachedGuides;
}

export async function findGuideForUrl(urlString) {
  if (!urlString) {
    return null;
  }

  const guides = await loadSiteGuides();
  let hostname = "";

  try {
    hostname = new URL(urlString).hostname.toLowerCase();
  } catch {
    return null;
  }

  return (
    guides.find((guide) =>
      Array.isArray(guide.matches) &&
      guide.matches.some((token) => hostname.includes(String(token).toLowerCase()))
    ) ?? null
  );
}

