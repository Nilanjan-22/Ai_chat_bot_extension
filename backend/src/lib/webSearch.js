function safeHostname(urlString) {
  try {
    return new URL(urlString).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

export function buildAllowedDomains({ pageContext, guide }) {
  const currentHost = safeHostname(pageContext?.url);
  const guideDomains = Array.isArray(guide?.allowedDomains)
    ? guide.allowedDomains
    : [];
  const sourceDomains = Array.isArray(guide?.sources)
    ? guide.sources.map((source) => safeHostname(source.url))
    : [];

  return uniqueStrings([currentHost, ...guideDomains, ...sourceDomains]);
}

export function shouldUseWebSearch({ useWebSearch, guide }) {
  if (!useWebSearch) {
    return false;
  }

  return true;
}

