const SPEECH_LOCALES = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN"
};

const transcriptEl = document.getElementById("transcript");
const statusEl = document.getElementById("status");
const stopBtn = document.getElementById("stop-btn");

// Read the language from the URL query parameter.
const params = new URLSearchParams(window.location.search);
const language = params.get("lang") || "en";
const locale = SPEECH_LOCALES[language] || "en-IN";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  transcriptEl.textContent = "Speech recognition is not supported.";
  transcriptEl.className = "error";
  chrome.runtime.sendMessage({
    type: "VOICE_POPUP_ERROR",
    error: "not-supported"
  }).catch(() => {});
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = locale;
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    statusEl.textContent = "Listening...";
    chrome.runtime.sendMessage({ type: "VOICE_POPUP_START" }).catch(() => {});
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();

    transcriptEl.textContent = transcript || "...";

    chrome.runtime.sendMessage({
      type: "VOICE_POPUP_RESULT",
      transcript
    }).catch(() => {});
  };

  recognition.onerror = (event) => {
    const error = event?.error || "unknown";
    if (error === "not-allowed") {
      transcriptEl.textContent = "Microphone access denied. Please allow and try again.";
      transcriptEl.className = "error";
    } else if (error === "no-speech") {
      transcriptEl.textContent = "No speech detected.";
    } else {
      transcriptEl.textContent = "Error: " + error;
      transcriptEl.className = "error";
    }
    statusEl.textContent = "";

    chrome.runtime.sendMessage({
      type: "VOICE_POPUP_ERROR",
      error
    }).catch(() => {});

    // Close the window after a short delay on error.
    setTimeout(() => window.close(), 2000);
  };

  recognition.onend = () => {
    statusEl.textContent = "Done";
    chrome.runtime.sendMessage({ type: "VOICE_POPUP_END" }).catch(() => {});
    // Auto-close the popup window after recognition ends.
    setTimeout(() => window.close(), 300);
  };

  stopBtn.addEventListener("click", () => {
    recognition.stop();
  });

  // Start recognition immediately.
  try {
    recognition.start();
  } catch (err) {
    transcriptEl.textContent = "Could not start voice input.";
    transcriptEl.className = "error";
    chrome.runtime.sendMessage({
      type: "VOICE_POPUP_ERROR",
      error: "start-failed"
    }).catch(() => {});
  }
}
