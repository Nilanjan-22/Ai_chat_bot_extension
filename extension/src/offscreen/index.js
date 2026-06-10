const SPEECH_LOCALES = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN"
};

let recognition = null;

function getSpeechLocale(language) {
  return SPEECH_LOCALES[language] || "en-IN";
}

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

async function startRecognition(language) {
  stopRecognition();

  const RecognitionCtor = getSpeechRecognitionConstructor();

  if (!RecognitionCtor) {
    chrome.runtime.sendMessage({
      type: "OFFSCREEN_VOICE_ERROR",
      error: "not-supported"
    }).catch(() => {});
    return;
  }

  // Explicitly request microphone permission via getUserMedia.
  // Chrome requires this in offscreen documents before SpeechRecognition can work.
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately — SpeechRecognition manages its own.
    stream.getTracks().forEach((track) => track.stop());
  } catch (err) {
    const errorName = err?.name || "unknown";
    chrome.runtime.sendMessage({
      type: "OFFSCREEN_VOICE_ERROR",
      error: errorName === "NotAllowedError" ? "not-allowed"
           : errorName === "NotFoundError" ? "not-found"
           : errorName
    }).catch(() => {});
    return;
  }

  recognition = new RecognitionCtor();
  recognition.lang = getSpeechLocale(language);
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    chrome.runtime.sendMessage({ type: "OFFSCREEN_VOICE_START" }).catch(() => {});
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();

    const isFinal = event.results[event.results.length - 1]?.isFinal ?? false;

    chrome.runtime.sendMessage({
      type: "OFFSCREEN_VOICE_RESULT",
      transcript,
      isFinal
    }).catch(() => {});
  };

  recognition.onerror = (event) => {
    chrome.runtime.sendMessage({
      type: "OFFSCREEN_VOICE_ERROR",
      error: event?.error || "unknown"
    }).catch(() => {});
  };

  recognition.onend = () => {
    recognition = null;
    chrome.runtime.sendMessage({ type: "OFFSCREEN_VOICE_END" }).catch(() => {});
  };

  try {
    recognition.start();
  } catch (err) {
    recognition = null;
    chrome.runtime.sendMessage({
      type: "OFFSCREEN_VOICE_ERROR",
      error: "start-failed"
    }).catch(() => {});
  }
}

function stopRecognition() {
  if (recognition) {
    try {
      recognition.stop();
    } catch {}
    recognition = null;
  }
}

// Listen for commands from the background service worker.
// Uses OFFSCREEN_CMD_* prefix to avoid collisions with side panel messages.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message?.type) {
    case "OFFSCREEN_CMD_START":
      startRecognition(message.language || "en");
      sendResponse({ ok: true });
      return true;
    case "OFFSCREEN_CMD_STOP":
      stopRecognition();
      sendResponse({ ok: true });
      return true;
    default:
      return false;
  }
});

// Signal that the offscreen document is ready to receive commands.
chrome.runtime.sendMessage({ type: "OFFSCREEN_READY" }).catch(() => {});
