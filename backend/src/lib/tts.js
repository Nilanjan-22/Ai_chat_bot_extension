const SUPPORTED_TTS_LANGUAGES = new Set(["en", "hi", "bn"]);

function getTtsBaseUrl() {
  return (process.env.TTS_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
}

function getTtsApiKey() {
  return process.env.TTS_API_KEY || process.env.OPENAI_TTS_API_KEY || "";
}

function getVoiceForLanguage(language) {
  const specificVoice = process.env[`TTS_VOICE_${language.toUpperCase()}`];
  return specificVoice || process.env.TTS_VOICE || "alloy";
}

function getInstructions(language) {
  if (language === "hi") {
    return "Speak naturally in Indian Hindi with clear, warm pronunciation and a helpful guide-like tone.";
  }

  if (language === "bn") {
    return "Speak naturally in Bengali with clear, warm pronunciation and a helpful guide-like tone.";
  }

  return "Speak clearly in a warm, helpful guide-like tone.";
}

export async function generateSpeechAudio({ text, language }) {
  if (!SUPPORTED_TTS_LANGUAGES.has(language)) {
    const error = new Error("Unsupported TTS language.");
    error.statusCode = 400;
    throw error;
  }

  const apiKey = getTtsApiKey();

  if (!apiKey) {
    const error = new Error("TTS is not configured. Set TTS_API_KEY or OPENAI_TTS_API_KEY.");
    error.statusCode = 501;
    throw error;
  }

  const input = String(text || "").trim();

  if (!input) {
    const error = new Error("Text is required for TTS.");
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(`${getTtsBaseUrl()}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.TTS_MODEL || "gpt-4o-mini-tts",
      voice: getVoiceForLanguage(language),
      input: input.slice(0, 4000),
      instructions: getInstructions(language),
      response_format: "mp3"
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    const error = new Error(details || `TTS request failed with status ${response.status}.`);
    error.statusCode = response.status;
    throw error;
  }

  return Buffer.from(await response.arrayBuffer());
}
