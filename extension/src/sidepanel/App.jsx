import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEYS = {
  backendUrl: "assistant_backend_url",
  language: "assistant_language",
  useWebSearch: "assistant_use_web_search",
  autoSpeak: "assistant_auto_speak"
};

const SPEECH_LOCALES = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN"
};

const MICROPHONE_SETTINGS_URL = "chrome://settings/content/microphone";
const BUILD_LABEL = "Build 0.1.1 voice-direct";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
  { value: "bn", label: "বাংলা" }
];

const LANGUAGE_LABELS = {
  en: "English",
  hi: "हिंदी",
  bn: "বাংলা"
};

const UI = {
  en: {
    title: "Disha",
    subtitle: "Read-only guidance for complicated forms and official portals.",
    sync: "Refresh page context",
    grant: "Grant access to this site",
    unsupported: "Open a regular website to use the assistant.",
    quickExplain: "Explain this page",
    quickNext: "What should I do next?",
    quickDocs: "What documents might be needed here?",
    placeholder: "Ask what this page, checkbox, field, or step means...",
    send: "Ask",
    currentSite: "Current site",
    fields: "Visible fields",
    settings: "Assistant settings",
    privacy: "This assistant reads visible structure only. It does not fill forms or submit data.",
    permissionNote: "Grant one-site access before the assistant can read this page.",
    thinking: "Thinking...",
    askWeb: "Use official web grounding",
    askWebHint: "When enabled, the backend may use restricted web search to pull current official guidance.",
    assistantReady: "I can explain the current page, field labels, and next steps in a read-only way.",
    statusProtected: "Read-only",
    statusGrounded: "Web-grounded",
    statusFallback: "Fallback",
    statusLive: "Live model",
    sources: "Sources",
    pageSummary: "Page snapshot",
    promptIdeas: "Helpful prompts",
    noWebsite: "No active website",
    clearChat: "Clear chat",
    voiceInput: "Voice input",
    stopListening: "Stop listening",
    listening: "Listening...",
    readAloud: "Read aloud",
    stopAudio: "Stop audio",
    autoSpeak: "Read replies aloud automatically",
    autoSpeakHint: "Useful when the assistant is guiding someone through a process step by step.",
    voiceUnsupported: "Voice input is not supported in this Chrome profile.",
    speechPlaybackUnsupported: "Audio playback is not supported in this Chrome profile.",
    microphoneBlocked: "Microphone permission was blocked.",
    microphoneDisabled: "Chrome denied microphone access for Disha. Open microphone settings, make sure sites can ask, then reload the extension and try again.",
    microphoneNotFound: "No microphone was found on this device.",
    openMicSettings: "Open mic settings",
    noSpeechDetected: "No speech was detected. Please try again.",
    voiceStartFailed: "Voice input could not start."
  },
  hi: {
    title: "साइट गाइड असिस्टेंट",
    subtitle: "जटिल फॉर्म और आधिकारिक पोर्टल के लिए केवल मार्गदर्शन.",
    sync: "पेज जानकारी दोबारा पढ़ें",
    grant: "इस साइट की अनुमति दें",
    unsupported: "असिस्टेंट के लिए कोई सामान्य वेबसाइट खोलें।",
    quickExplain: "यह पेज समझाइए",
    quickNext: "मुझे अगला क्या करना चाहिए?",
    quickDocs: "यहां कौन से दस्तावेज़ लग सकते हैं?",
    placeholder: "पूछें कि यह पेज, चेकबॉक्स, फ़ील्ड या चरण किस लिए है...",
    send: "पूछें",
    currentSite: "वर्तमान साइट",
    fields: "दिख रहे फ़ील्ड",
    settings: "असिस्टेंट सेटिंग्स",
    privacy: "यह असिस्टेंट केवल दिख रही संरचना पढ़ता है। यह फॉर्म नहीं भरता और डेटा सबमिट नहीं करता।",
    permissionNote: "पेज पढ़ने से पहले इस साइट की अनुमति दें।",
    thinking: "सोच रहा है...",
    askWeb: "आधिकारिक वेब जानकारी उपयोग करें",
    askWebHint: "इसे चालू करने पर बैकएंड मौजूदा आधिकारिक जानकारी के लिए सीमित वेब सर्च उपयोग कर सकता है।",
    assistantReady: "मैं वर्तमान पेज, फ़ील्ड लेबल और अगले चरण केवल मार्गदर्शन के रूप में समझा सकता हूँ।",
    statusProtected: "केवल मार्गदर्शन",
    statusGrounded: "वेब-ग्राउंडेड",
    statusFallback: "फॉलबैक",
    statusLive: "लाइव मॉडल",
    sources: "स्रोत",
    pageSummary: "पेज सारांश",
    promptIdeas: "उपयोगी प्रश्न",
    noWebsite: "कोई सक्रिय वेबसाइट नहीं",
    clearChat: "चैट साफ करें"
  },
  bn: {
    title: "সাইট গাইড অ্যাসিস্ট্যান্ট",
    subtitle: "জটিল ফর্ম ও অফিসিয়াল পোর্টালের জন্য শুধু দিকনির্দেশনা।",
    sync: "পেজ কনটেক্সট আবার নিন",
    grant: "এই সাইটে অনুমতি দিন",
    unsupported: "অ্যাসিস্ট্যান্ট ব্যবহার করতে একটি সাধারণ ওয়েবসাইট খুলুন।",
    quickExplain: "এই পেজটি বুঝিয়ে বলুন",
    quickNext: "এখন আমার কী করা উচিত?",
    quickDocs: "এখানে কী কী নথি লাগতে পারে?",
    placeholder: "জিজ্ঞাসা করুন এই পেজ, চেকবক্স, ফিল্ড বা ধাপটি কী জন্য...",
    send: "জিজ্ঞাসা করুন",
    currentSite: "বর্তমান সাইট",
    fields: "দেখা যাচ্ছে এমন ফিল্ড",
    settings: "অ্যাসিস্ট্যান্ট সেটিংস",
    privacy: "এই অ্যাসিস্ট্যান্ট শুধু দৃশ্যমান গঠন পড়ে। এটি ফর্ম পূরণ বা ডাটা সাবমিট করে না।",
    permissionNote: "পেজ পড়ার আগে এই সাইটে অনুমতি দিন।",
    thinking: "ভাবছে...",
    askWeb: "অফিশিয়াল ওয়েব তথ্য ব্যবহার করুন",
    askWebHint: "এটি চালু থাকলে ব্যাকএন্ড বর্তমান অফিসিয়াল তথ্যের জন্য সীমিত ওয়েব সার্চ ব্যবহার করতে পারে।",
    assistantReady: "আমি বর্তমান পেজ, ফিল্ড লেবেল এবং পরের ধাপ শুধু নির্দেশনা হিসেবে বুঝিয়ে বলতে পারি।",
    statusProtected: "শুধু গাইডেন্স",
    statusGrounded: "ওয়েব-গ্রাউন্ডেড",
    statusFallback: "ফলব্যাক",
    statusLive: "লাইভ মডেল",
    sources: "সূত্র",
    pageSummary: "পেজ সারাংশ",
    promptIdeas: "উপকারী প্রশ্ন",
    noWebsite: "কোনও সক্রিয় ওয়েবসাইট নেই",
    clearChat: "চ্যাট পরিষ্কার করুন"
  }
};

const UI_OVERRIDES = {
  hi: {
    title: "दिशा",
    subtitle: "जटिल फॉर्म और आधिकारिक पोर्टल के लिए केवल मार्गदर्शन।",
    sync: "पेज जानकारी दोबारा पढ़ें",
    grant: "इस साइट की अनुमति दें",
    unsupported: "असिस्टेंट का उपयोग करने के लिए कोई सामान्य वेबसाइट खोलें।",
    quickExplain: "यह पेज समझाइए",
    quickNext: "मुझे अगला क्या करना चाहिए?",
    quickDocs: "यहां कौन से दस्तावेज़ लग सकते हैं?",
    placeholder: "पूछें कि यह पेज, चेकबॉक्स, फ़ील्ड या चरण किस लिए है...",
    send: "पूछें",
    currentSite: "वर्तमान साइट",
    fields: "दिख रहे फ़ील्ड",
    settings: "असिस्टेंट सेटिंग्स",
    privacy: "यह असिस्टेंट केवल दिख रही संरचना पढ़ता है। यह फॉर्म नहीं भरता और डेटा सबमिट नहीं करता।",
    permissionNote: "पेज पढ़ने से पहले इस साइट की अनुमति दें।",
    thinking: "सोच रहा है...",
    askWeb: "आधिकारिक वेब जानकारी उपयोग करें",
    askWebHint: "इसे चालू करने पर बैकएंड मौजूदा आधिकारिक जानकारी के लिए सीमित वेब सर्च का उपयोग कर सकता है।",
    assistantReady: "मैं वर्तमान पेज, फ़ील्ड लेबल और अगले चरण केवल मार्गदर्शन के रूप में समझा सकता हूँ।",
    statusProtected: "केवल मार्गदर्शन",
    statusGrounded: "वेब-ग्राउंडेड",
    statusFallback: "फॉलबैक",
    statusLive: "लाइव मॉडल",
    sources: "स्रोत",
    pageSummary: "पेज सारांश",
    promptIdeas: "उपयोगी प्रश्न",
    noWebsite: "कोई सक्रिय वेबसाइट नहीं",
    clearChat: "चैट साफ करें",
    voiceInput: "आवाज़ से बोलें",
    stopListening: "सुनना रोकें",
    listening: "सुन रहा है...",
    readAloud: "जवाब सुनें",
    stopAudio: "ऑडियो रोकें",
    autoSpeak: "जवाब अपने-आप पढ़ें",
    autoSpeakHint: "जब असिस्टेंट किसी प्रक्रिया में चरण-दर-चरण मदद कर रहा हो तब यह उपयोगी है।",
    voiceUnsupported: "इस Chrome प्रोफ़ाइल में वॉइस इनपुट समर्थित नहीं है।",
    speechPlaybackUnsupported: "इस Chrome प्रोफ़ाइल में ऑडियो प्लेबैक समर्थित नहीं है।",
    microphoneBlocked: "माइक्रोफ़ोन अनुमति अवरुद्ध हो गई।",
    microphoneDisabled: "Chrome ने Disha के लिए माइक्रोफ़ोन access रोका है। माइक्रोफ़ोन सेटिंग खोलें, sites can ask allow करें, फिर extension reload करके दोबारा कोशिश करें।",
    microphoneNotFound: "इस डिवाइस पर माइक्रोफ़ोन नहीं मिला।",
    openMicSettings: "माइक्रोफ़ोन सेटिंग खोलें",
    noSpeechDetected: "कोई आवाज़ नहीं मिली। कृपया फिर से कोशिश करें।",
    voiceStartFailed: "वॉइस इनपुट शुरू नहीं हो सका।"
  },
  bn: {
    title: "দিশা",
    subtitle: "জটিল ফর্ম ও অফিসিয়াল পোর্টালের জন্য শুধু দিকনির্দেশনা।",
    sync: "পেজ কনটেক্সট আবার নিন",
    grant: "এই সাইটে অনুমতি দিন",
    unsupported: "অ্যাসিস্ট্যান্ট ব্যবহার করতে একটি সাধারণ ওয়েবসাইট খুলুন।",
    quickExplain: "এই পেজটি বুঝিয়ে বলুন",
    quickNext: "এখন আমার কী করা উচিত?",
    quickDocs: "এখানে কী কী নথি লাগতে পারে?",
    placeholder: "জিজ্ঞাসা করুন এই পেজ, চেকবক্স, ফিল্ড বা ধাপটি কী জন্য...",
    send: "জিজ্ঞাসা করুন",
    currentSite: "বর্তমান সাইট",
    fields: "দেখা যাচ্ছে এমন ফিল্ড",
    settings: "অ্যাসিস্ট্যান্ট সেটিংস",
    privacy: "এই অ্যাসিস্ট্যান্ট শুধু দৃশ্যমান গঠন পড়ে। এটি ফর্ম পূরণ বা ডাটা সাবমিট করে না।",
    permissionNote: "পেজ পড়ার আগে এই সাইটে অনুমতি দিন।",
    thinking: "ভাবছে...",
    askWeb: "অফিশিয়াল ওয়েব তথ্য ব্যবহার করুন",
    askWebHint: "এটি চালু থাকলে ব্যাকএন্ড বর্তমান অফিসিয়াল তথ্যের জন্য সীমিত ওয়েব সার্চ ব্যবহার করতে পারে।",
    assistantReady: "আমি বর্তমান পেজ, ফিল্ড লেবেল এবং পরের ধাপ শুধু নির্দেশনা হিসেবে বুঝিয়ে বলতে পারি।",
    statusProtected: "শুধু গাইডেন্স",
    statusGrounded: "ওয়েব-গ্রাউন্ডেড",
    statusFallback: "ফলব্যাক",
    statusLive: "লাইভ মডেল",
    sources: "সূত্র",
    pageSummary: "পেজ সারাংশ",
    promptIdeas: "উপকারী প্রশ্ন",
    noWebsite: "কোনও সক্রিয় ওয়েবসাইট নেই",
    clearChat: "চ্যাট পরিষ্কার করুন",
    voiceInput: "ভয়েস ইনপুট",
    stopListening: "শোনা বন্ধ করুন",
    listening: "শুনছে...",
    readAloud: "শুনিয়ে দিন",
    stopAudio: "অডিও বন্ধ করুন",
    autoSpeak: "উত্তর নিজে থেকে পড়ে শোনান",
    autoSpeakHint: "ধাপে ধাপে কাউকে গাইড করার সময় এটি উপকারী।",
    voiceUnsupported: "এই Chrome প্রোফাইলে ভয়েস ইনপুট সমর্থিত নয়।",
    speechPlaybackUnsupported: "এই Chrome প্রোফাইলে অডিও প্লেব্যাক সমর্থিত নয়।",
    microphoneBlocked: "মাইক্রোফোন অনুমতি ব্লক করা হয়েছে।",
    microphoneDisabled: "Chrome Disha-র জন্য microphone access আটকেছে। Microphone setting খুলুন, sites can ask allow করুন, তারপর extension reload করে আবার চেষ্টা করুন।",
    microphoneNotFound: "এই ডিভাইসে কোনও মাইক্রোফোন পাওয়া যায়নি।",
    openMicSettings: "মাইক্রোফোন সেটিং খুলুন",
    noSpeechDetected: "কোনও কথা ধরা পড়েনি। আবার চেষ্টা করুন।",
    voiceStartFailed: "ভয়েস ইনপুট শুরু করা যায়নি।"
  }
};

function getLocalizedCopy(language) {
  return {
    ...UI.en,
    ...(UI[language] ?? {}),
    ...(UI_OVERRIDES[language] ?? {})
  };
}

function getInitialAssistantMessage(language) {
  return createAssistantMessage(getLocalizedCopy(language).assistantReady, {
    mode: "model"
  });
}

function getChromeStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

function setChromeStorage(values) {
  return new Promise((resolve) => {
    chrome.storage.local.set(values, resolve);
  });
}

function sendRuntimeMessage(payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(payload, resolve);
  });
}

function extractHostname(urlString) {
  try {
    return new URL(urlString).hostname;
  } catch {
    return "";
  }
}

function toOriginPattern(urlString) {
  const url = new URL(urlString);
  return `${url.protocol}//${url.hostname}/*`;
}

function extractDomainLabel(urlString) {
  try {
    return new URL(urlString).hostname.replace(/^www\./, "");
  } catch {
    return urlString;
  }
}

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getSpeechLocale(language) {
  return SPEECH_LOCALES[language] || "en-IN";
}

function stripMarkdownForSpeech(text) {
  return String(text || "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadSpeechVoices() {
  if (!("speechSynthesis" in window)) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

function pickBestSpeechVoice(voices, language) {
  const locale = getSpeechLocale(language).toLowerCase();
  const languageCode = locale.split("-")[0];

  const candidates = voices.filter((voice) =>
    String(voice.lang || "").toLowerCase().startsWith(languageCode)
  );

  if (!candidates.length) {
    return null;
  }

  const scoreVoice = (voice) => {
    const voiceLang = String(voice.lang || "").toLowerCase();
    const voiceName = String(voice.name || "").toLowerCase();
    let score = 0;

    if (voiceLang === locale) score += 50;
    if (voiceLang.startsWith(languageCode)) score += 25;
    if (voiceName.includes("google")) score += 10;
    if (voiceName.includes("microsoft")) score += 8;
    if (voice.localService) score += 3;

    return score;
  };

  return [...candidates].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

function parseInlineMarkdown(text) {
  const fragments = [];
  const pattern = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match = pattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      fragments.push({
        type: "text",
        value: text.slice(lastIndex, match.index)
      });
    }

    if (match[2]) {
      fragments.push({
        type: "strong",
        value: match[2]
      });
    } else if (match[3] && match[4]) {
      fragments.push({
        type: "link",
        label: match[3],
        url: match[4]
      });
    }

    lastIndex = pattern.lastIndex;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    fragments.push({
      type: "text",
      value: text.slice(lastIndex)
    });
  }

  return fragments;
}

function InlineMarkdown({ text }) {
  const fragments = parseInlineMarkdown(text);

  return fragments.map((fragment, index) => {
    if (fragment.type === "strong") {
      return (
        <strong key={`strong-${index}`} className="font-semibold text-slate-900">
          {fragment.value}
        </strong>
      );
    }

    if (fragment.type === "link") {
      return (
        <a
          key={`link-${index}`}
          href={fragment.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-clay underline decoration-clay/40 underline-offset-4 transition hover:text-amber-700"
        >
          {fragment.label}
        </a>
      );
    }

    return <React.Fragment key={`text-${index}`}>{fragment.value}</React.Fragment>;
  });
}

function buildBlocks(text) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line || /^\|?[-:\s|]{3,}\|?$/.test(line)) {
      index += 1;
      continue;
    }

    if (/^#{1,4}\s+/.test(line)) {
      blocks.push({
        type: "heading",
        level: Math.min((line.match(/^#+/)?.[0].length ?? 1), 4),
        text: line.replace(/^#{1,4}\s+/, "")
      });
      index += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines = [];

      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }

      if (tableLines.length >= 2 && /^\|?[-:\s|]{3,}\|?$/.test(tableLines[1])) {
        const parseCells = (row) =>
          row
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((cell) => cell.trim())
            .filter(Boolean);

        const headers = parseCells(tableLines[0]);
        const rows = tableLines.slice(2).map(parseCells).filter((cells) => cells.length);

        if (headers.length) {
          blocks.push({
            type: "table",
            headers,
            rows
          });
          continue;
        }
      }

      blocks.push({
        type: "paragraph",
        text: tableLines
          .map((row) => row.replace(/\|/g, " ").replace(/\s+/g, " ").trim())
          .join(" ")
      });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "ordered", items });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "bullet", items });
      continue;
    }

    const paragraphLines = [line];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^\d+\.\s+/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    const paragraph = paragraphLines.join(" ");
    const headingMatch = paragraph.match(/^\*\*(.+)\*\*$/);

    if (headingMatch) {
      blocks.push({ type: "heading", text: headingMatch[1] });
    } else {
      blocks.push({ type: "paragraph", text: paragraph });
    }
  }

  return blocks;
}

function MessageBody({ text }) {
  const blocks = buildBlocks(text);

  return (
    <div className="space-y-3 text-[15px] leading-7 text-slate-700">
      {blocks.map((block, index) => {
      if (block.type === "heading") {
        return (
          <h4
            key={index}
            className={`text-slate-900 ${
              block.level <= 2 ? "text-lg font-semibold" : "text-base font-semibold"
            }`}
          >
            <InlineMarkdown text={block.text} />
          </h4>
        );
      }

        if (block.type === "table") {
          return (
            <div key={index} className="grid gap-3 md:grid-cols-2">
              {block.rows.length
                ? block.rows.map((row, rowIndex) => (
                    <div
                      key={`${index}-${rowIndex}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                    >
                      {block.headers.map((header, headerIndex) => (
                        <div key={`${rowIndex}-${headerIndex}`} className="mb-2 last:mb-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {header}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            <InlineMarkdown text={row[headerIndex] ?? ""} />
                          </p>
                        </div>
                      ))}
                    </div>
                  ))
                : block.headers.map((header, headerIndex) => (
                    <div
                      key={`${index}-${headerIndex}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {header}
                      </p>
                    </div>
                  ))}
            </div>
          );
        }

        if (block.type === "ordered") {
          return (
            <ol key={index} className="space-y-2 pl-5 marker:font-semibold marker:text-clay">
              {block.items.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`} className="pl-1">
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "bullet") {
          return (
            <ul key={index} className="space-y-2 pl-5 marker:text-moss">
              {block.items.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`} className="list-disc pl-1">
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index}>
            <InlineMarkdown text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

function createAssistantMessage(answer, extra = {}) {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: answer,
    sources: extra.sources ?? [],
    warning: extra.warning ?? null,
    webSearchUsed: Boolean(extra.webSearchUsed),
    mode: extra.mode ?? "model"
  };
}

function createUserMessage(text) {
  return {
    id: crypto.randomUUID(),
    role: "user",
    text
  };
}

function PulseDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${dot * 180}ms` }}
        />
      ))}
    </span>
  );
}

function MessageCard({ message, copy, onSpeak, speakingMessageId, isIndicLanguage }) {
  if (message.role === "user") {
    return (
      <div className="ml-8 flex items-end justify-end gap-3">
        <article className="max-w-[88%] rounded-[28px] rounded-br-md bg-[linear-gradient(135deg,#172033,#22314f)] px-4 py-3 text-white shadow-lg shadow-slate-900/10">
          <p className={`text-sm text-white/95 ${isIndicLanguage ? "leading-7 tracking-[0.01em]" : "leading-6"}`}>
            {message.text}
          </p>
        </article>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-xs font-semibold text-white shadow-md">
          You
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#14532d,#2a7a58)] text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-md">
        AI
      </div>
      <article className="flex-1 overflow-hidden rounded-[30px] border border-white/80 bg-white/92 shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[linear-gradient(135deg,rgba(245,239,227,0.95),rgba(255,255,255,0.95))] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              Disha
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
              {copy.statusProtected}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {message.webSearchUsed ? copy.statusGrounded : message.mode === "fallback" ? copy.statusFallback : copy.statusLive}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSpeak(message)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-clay hover:text-clay"
          >
            {speakingMessageId === message.id ? copy.stopAudio : copy.readAloud}
          </button>
        </div>
        <div className="px-4 py-4">
          <div className={isIndicLanguage ? "tracking-[0.01em]" : ""}>
            <MessageBody text={message.text} />
          </div>
          {message.warning ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {message.warning}
            </p>
          ) : null}
          {message.sources?.length ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {copy.sources}
              </p>
              <div className="mt-3 grid gap-2">
                {message.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-clay hover:bg-amber-50"
                  >
                    <p className="text-sm font-medium text-slate-800 group-hover:text-slate-950">
                      {source.title || extractDomainLabel(source.url)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{extractDomainLabel(source.url)}</p>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState("en");
  const [backendUrl, setBackendUrl] = useState("http://localhost:8787");
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState(null);
  const [pageContext, setPageContext] = useState(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [micPermissionBlocked, setMicPermissionBlocked] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [speechVoices, setSpeechVoices] = useState([]);
  const audioRef = useRef(null);

  const copy = useMemo(() => getLocalizedCopy(language), [language]);
  const isIndicLanguage = language === "hi" || language === "bn";
  const voiceSupported = true;
  const speechSynthesisSupported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    []
  );

  useEffect(() => {
    (async () => {
      const stored = await getChromeStorage([
        STORAGE_KEYS.backendUrl,
        STORAGE_KEYS.language,
        STORAGE_KEYS.useWebSearch,
        STORAGE_KEYS.autoSpeak
      ]);

      const nextLanguage = stored[STORAGE_KEYS.language] ?? "en";
      const nextBackendUrl = stored[STORAGE_KEYS.backendUrl] ?? "http://localhost:8787";
      const nextUseWebSearch =
        typeof stored[STORAGE_KEYS.useWebSearch] === "boolean"
          ? stored[STORAGE_KEYS.useWebSearch]
          : true;
      const nextAutoSpeak =
        typeof stored[STORAGE_KEYS.autoSpeak] === "boolean"
          ? stored[STORAGE_KEYS.autoSpeak]
          : false;

      setLanguage(nextLanguage);
      setBackendUrl(nextBackendUrl);
      setUseWebSearch(nextUseWebSearch);
      setAutoSpeak(nextAutoSpeak);
      setMessages([getInitialAssistantMessage(nextLanguage)]);
      await refreshPageContext();
    })();
  }, []);

  useEffect(() => {
    setChromeStorage({
      [STORAGE_KEYS.language]: language,
      [STORAGE_KEYS.backendUrl]: backendUrl,
      [STORAGE_KEYS.useWebSearch]: useWebSearch,
      [STORAGE_KEYS.autoSpeak]: autoSpeak
    });
  }, [autoSpeak, backendUrl, language, useWebSearch]);

  useEffect(() => {
    const handleOffscreenMessage = (message) => {
      switch (message?.type) {
        case "VOICE_POPUP_START":
          setError("");
          setIsListening(true);
          break;
        case "VOICE_POPUP_RESULT":
          if (message.transcript) {
            setMessageInput(message.transcript);
          }
          break;
        case "VOICE_POPUP_ERROR":
          if (message.error === "not-allowed") {
            setMicPermissionBlocked(true);
            setError(copy.microphoneDisabled);
          } else if (message.error === "no-speech") {
            setError(copy.noSpeechDetected);
          } else if (message.error === "not-supported") {
            setError(copy.voiceUnsupported);
          } else {
            setError(copy.voiceStartFailed);
          }
          setIsListening(false);
          break;
        case "VOICE_POPUP_END":
          setIsListening(false);
          break;
        default:
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handleOffscreenMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleOffscreenMessage);

      sendRuntimeMessage({ type: "STOP_VOICE_RECOGNITION" }).catch(() => {});

      if (speechSynthesisSupported) {
        window.speechSynthesis.cancel();
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [speechSynthesisSupported, copy]);

  useEffect(() => {
    if (!speechSynthesisSupported) {
      return;
    }

    const refreshVoices = () => {
      setSpeechVoices(loadSpeechVoices());
    };

    refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
    };
  }, [speechSynthesisSupported]);

  async function refreshPageContext() {
    setLoadingContext(true);
    setError("");

    const tabResponse = await sendRuntimeMessage({ type: "GET_ACTIVE_TAB" });
    const activeTab = tabResponse?.tab ?? null;
    setTab(activeTab);

    if (!activeTab?.id || !activeTab?.url?.startsWith("http")) {
      setNeedsPermission(false);
      setPageContext(null);
      setLoadingContext(false);
      return;
    }

    const contextResponse = await sendRuntimeMessage({
      type: "GET_PAGE_CONTEXT",
      tabId: activeTab.id,
      url: activeTab.url
    });

    if (!contextResponse?.ok) {
      setNeedsPermission(Boolean(contextResponse?.needsPermission));
      setPageContext(null);
      setError(contextResponse?.error ?? "");
      setLoadingContext(false);
      return;
    }

    setNeedsPermission(false);
    setPageContext(contextResponse.pageContext);
    setLoadingContext(false);
  }

  async function grantPermission() {
    if (!tab?.id || !tab?.url) {
      return;
    }

    setError("");

    try {
      const granted = await chrome.permissions.request({
        origins: [toOriginPattern(tab.url)]
      });

      if (!granted) {
        setError("Site access was not granted.");
        return;
      }
    } catch (permissionError) {
      setError(
        permissionError instanceof Error
          ? permissionError.message
          : "Permission could not be granted."
      );
      return;
    }

    await refreshPageContext();
  }

  async function askAssistant(question) {
    const trimmed = question.trim();
    if (!trimmed || !pageContext) {
      return;
    }

    const nextMessages = [...messages, createUserMessage(trimmed)];
    setMessages(nextMessages);
    setMessageInput("");
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: trimmed,
          language,
          pageContext,
          useWebSearch
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Backend request failed.");
      }

      const payload = await response.json();
      const assistantMessage = createAssistantMessage(payload.answer, {
        sources: payload.sources,
        warning: payload.warning,
        webSearchUsed: payload.webSearchUsed,
        mode: payload.mode
      });

      setMessages([
        ...nextMessages,
        assistantMessage
      ]);

      if (autoSpeak) {
        window.setTimeout(() => {
          speakAssistantMessage(assistantMessage);
        }, 50);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unknown request error.");
    } finally {
      setSubmitting(false);
    }
  }

  function stopSpeechPlayback() {
    if (audioRef.current) {
      const objectUrl = audioRef.current.dataset.objectUrl;
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      audioRef.current = null;
    }

    if (speechSynthesisSupported) {
      window.speechSynthesis.cancel();
    }

    setSpeakingMessageId(null);
  }

  function clearChat() {
    sendRuntimeMessage({ type: "STOP_VOICE_RECOGNITION" }).catch(() => {});

    stopSpeechPlayback();

    setMessages([getInitialAssistantMessage(language)]);
    setMessageInput("");
    setError("");
    setIsListening(false);
    setMicPermissionBlocked(false);
  }

  async function playBackendSpeech(message) {
    const text = stripMarkdownForSpeech(message.text);

    if (!text) {
      return false;
    }

    try {
      const response = await fetch(`${backendUrl}/api/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          language
        })
      });

      if (!response.ok) {
        return false;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      audio.dataset.objectUrl = objectUrl;

      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        setSpeakingMessageId(null);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        setSpeakingMessageId(null);
      };

      audioRef.current = audio;
      setSpeakingMessageId(message.id);
      setError("");
      await audio.play();
      return true;
    } catch {
      if (audioRef.current) {
        const objectUrl = audioRef.current.dataset.objectUrl;
        audioRef.current.pause();
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
        audioRef.current = null;
      }

      setSpeakingMessageId(null);
      return false;
    }
  }

  async function speakAssistantMessage(message) {
    if (speakingMessageId === message.id) {
      stopSpeechPlayback();
      return;
    }

    stopSpeechPlayback();

    if (isIndicLanguage && await playBackendSpeech(message)) {
      return;
    }

    if (!speechSynthesisSupported) {
      setError(copy.speechPlaybackUnsupported);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(stripMarkdownForSpeech(message.text));
    const selectedVoice = pickBestSpeechVoice(speechVoices, language);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = getSpeechLocale(language);
    }

    utterance.rate = isIndicLanguage ? 0.88 : 0.96;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    if (!selectedVoice && isIndicLanguage) {
      setError("For natural Hindi/Bengali pronunciation, configure backend TTS_API_KEY. Chrome's built-in voice may sound unnatural without an installed Indic voice.");
    } else {
      setError("");
    }

    setSpeakingMessageId(message.id);
    window.speechSynthesis.speak(utterance);
  }

  async function toggleVoiceInput() {
    if (isListening) {
      sendRuntimeMessage({ type: "STOP_VOICE_RECOGNITION" }).catch(() => {});
      setIsListening(false);
      return;
    }

    setMicPermissionBlocked(false);

    try {
      const result = await sendRuntimeMessage({
        type: "START_VOICE_RECOGNITION",
        language
      });

      if (result && !result.ok) {
        setError(result.error || copy.voiceStartFailed);
      }
    } catch {
      setIsListening(false);
      setError(copy.voiceStartFailed);
    }
  }

  async function openMicrophoneSettings() {
    try {
      const permissionUrl = chrome.runtime.getURL("mic-permission.html");
      await chrome.tabs.create({ url: permissionUrl });
    } catch {
      setError(`${copy.microphoneDisabled} Open ${MICROPHONE_SETTINGS_URL} manually.`);
    }
  }

  const quickActions = [copy.quickExplain, copy.quickNext, copy.quickDocs];
  const currentHost = tab?.url?.startsWith("http") ? extractHostname(tab.url) : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(21,101,192,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(217,119,6,0.18),_transparent_32%),linear-gradient(180deg,_#fffdf7_0%,_#f6efe2_46%,_#edf4ee_100%)] text-ink">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-4 font-body">
        <header className="overflow-hidden rounded-[32px] border border-white/80 bg-white/85 shadow-panel backdrop-blur">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_26%),linear-gradient(135deg,rgba(23,32,51,0.98),rgba(18,74,58,0.96))] px-5 py-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90">
                    AI Guide
                  </span>
                  <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                    Voice Ready
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    {BUILD_LABEL}
                  </span>
                </div>
                <p className="mt-3 font-display text-[30px] leading-tight">{copy.title}</p>
                <p className={`mt-2 max-w-xl text-sm text-white/80 ${isIndicLanguage ? "leading-7 tracking-[0.01em]" : ""}`}>
                  {copy.subtitle}
                </p>
              </div>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-white/30 transition focus:ring"
              >
                {LANGUAGES.map((option) => (
                  <option key={option.value} value={option.value} className="text-slate-900">
                    {LANGUAGE_LABELS[option.value] ?? option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 px-4 py-4 md:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-3xl bg-amber-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
                {copy.statusProtected}
              </p>
              <p className={`mt-2 text-sm text-amber-950 ${isIndicLanguage ? "leading-7 tracking-[0.01em]" : "leading-6"}`}>{copy.privacy}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50/90 px-4 py-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={useWebSearch}
                  onChange={(event) => setUseWebSearch(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-emerald-950">{copy.askWeb}</span>
                  <span className={`mt-1 block text-xs text-emerald-900/80 ${isIndicLanguage ? "leading-6 tracking-[0.01em]" : "leading-5"}`}>
                    {copy.askWebHint}
                  </span>
                </span>
              </label>
            </div>
          </div>
        </header>

        <section className="rounded-[30px] border border-white/80 bg-white/85 p-4 shadow-panel backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {copy.currentSite}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800">
                  {currentHost || copy.unsupported}
                </span>
                {!needsPermission && pageContext ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    Ready
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {pageContext?.title || currentHost || copy.unsupported}
              </p>
            </div>
            <button
              type="button"
              onClick={refreshPageContext}
              className="rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {copy.sync}
            </button>
          </div>

          {needsPermission ? (
            <div className="mt-4 rounded-[26px] border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-950">{copy.permissionNote}</p>
              <button
                type="button"
                onClick={grantPermission}
                className="mt-3 rounded-2xl bg-clay px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
              >
                {copy.grant}
              </button>
            </div>
          ) : null}

          {!needsPermission && pageContext ? (
            <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-[26px] border border-slate-100 bg-[linear-gradient(135deg,rgba(241,245,249,0.98),rgba(255,255,255,1))] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {copy.pageSummary}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {pageContext.currentStep || pageContext.title || "Current page"}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {pageContext.fields?.length || 0} visible fields, {pageContext.buttons?.length || 0} visible actions
                </p>
                {pageContext.errors?.length ? (
                  <p className="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-900">
                    {pageContext.errors[0]}
                  </p>
                ) : null}
                {pageContext.helperText?.[0] ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">{pageContext.helperText[0]}</p>
                ) : null}
              </div>
              <div className="rounded-[26px] border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(255,255,255,1))] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {copy.promptIdeas}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => askAssistant(action)}
                      disabled={submitting}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-left text-xs text-slate-700 transition enabled:hover:border-moss enabled:hover:text-moss disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!needsPermission && pageContext?.fields?.length ? (
            <div className="mt-4 rounded-[26px] border border-slate-100 bg-slate-50/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {copy.fields}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pageContext.fields.slice(0, 10).map((field) => (
                  <button
                    key={field.label}
                    type="button"
                    onClick={() => askAssistant(`Explain the "${field.label}" field.`)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 transition hover:border-clay hover:text-clay"
                  >
                    {field.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {loadingContext ? <p className="mt-3 text-sm text-slate-500">{copy.thinking}</p> : null}
          {error ? (
            <div className="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-900">
              <p>{error}</p>
              {micPermissionBlocked ? (
                <button
                  type="button"
                  onClick={openMicrophoneSettings}
                  className="mt-3 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-800 transition hover:bg-rose-100"
                >
                  {copy.openMicSettings}
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white/85 p-4 shadow-panel backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Chat
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Clean, step-by-step guidance with voice support and citations when available.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 md:flex">
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(event) => setAutoSpeak(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                <span>{copy.autoSpeak}</span>
              </label>
              <button
                type="button"
                onClick={clearChat}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                {copy.clearChat}
              </button>
            </div>
          </div>

          <div className="max-h-[46vh] space-y-4 overflow-y-auto pr-1">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                copy={copy}
                onSpeak={speakAssistantMessage}
                speakingMessageId={speakingMessageId}
                isIndicLanguage={isIndicLanguage}
              />
            ))}
          </div>

          <form
            className="mt-5 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-3 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              askAssistant(messageInput);
            }}
          >
            <label className="sr-only" htmlFor="assistant-question">
              Ask a question
            </label>
            <textarea
              id="assistant-question"
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              placeholder={copy.placeholder}
              rows={4}
              className={`w-full resize-none border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 ${isIndicLanguage ? "leading-7 tracking-[0.01em]" : "leading-6"}`}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  isListening
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-clay hover:text-clay"
                }`}
              >
                {isListening ? copy.stopListening : copy.voiceInput}
              </button>
              {isListening ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <PulseDots />
                  <span>{copy.listening}</span>
                </span>
              ) : null}
              {!voiceSupported ? (
                <span className="text-xs text-slate-500">{copy.voiceUnsupported}</span>
              ) : null}
              <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 md:hidden">
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(event) => setAutoSpeak(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                <span>Auto voice</span>
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                {currentHost || copy.noWebsite}
              </div>
              <button
                type="submit"
                disabled={!pageContext || submitting || !messageInput.trim()}
                className="rounded-2xl bg-moss px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? copy.thinking : copy.send}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
