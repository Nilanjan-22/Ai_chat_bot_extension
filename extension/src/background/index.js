function isSupportedPage(urlString) {
  if (!urlString) {
    return false;
  }

  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toOriginPattern(urlString) {
  const url = new URL(urlString);
  return `${url.protocol}//${url.hostname}/*`;
}

function serializeTab(tab) {
  return {
    id: tab?.id ?? null,
    title: tab?.title ?? "",
    url: tab?.url ?? "",
    active: Boolean(tab?.active)
  };
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0] ?? null;
}

async function ensureContentScript(tabId) {
  try {
    const ping = await chrome.tabs.sendMessage(tabId, { type: "PING" });
    if (ping?.ok) {
      return { ok: true };
    }
  } catch {
    // Inject below.
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not inject page reader."
    };
  }
}

async function requestSiteAccess(urlString, tabId) {
  if (!isSupportedPage(urlString)) {
    return {
      ok: false,
      error: "This page cannot be inspected. Open a regular website first."
    };
  }

  const originPattern = toOriginPattern(urlString);
  const alreadyGranted = await chrome.permissions.contains({
    origins: [originPattern]
  });

  const granted =
    alreadyGranted ||
    (await chrome.permissions.request({
      origins: [originPattern]
    }));

  if (!granted) {
    return {
      ok: false,
      error: "Site access was not granted."
    };
  }

  return ensureContentScript(tabId);
}

async function readPageContext(urlString, tabId) {
  if (!isSupportedPage(urlString)) {
    return {
      ok: false,
      error: "Only http and https pages are supported."
    };
  }

  const originPattern = toOriginPattern(urlString);
  const allowed = await chrome.permissions.contains({
    origins: [originPattern]
  });

  if (!allowed) {
    return {
      ok: false,
      needsPermission: true,
      error: "Grant access to this site before I can read it."
    };
  }

  const injected = await ensureContentScript(tabId);
  if (!injected.ok) {
    return injected;
  }

  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: "GET_PAGE_CONTEXT" });
    return response;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not read page details."
    };
  }
}

let voiceWindowId = null;

async function openVoicePopup(language) {
  // Close existing popup if any.
  if (voiceWindowId != null) {
    try {
      await chrome.windows.remove(voiceWindowId);
    } catch {}
    voiceWindowId = null;
  }

  const voiceUrl = chrome.runtime.getURL(`voice.html?lang=${encodeURIComponent(language)}`);

  const popup = await chrome.windows.create({
    url: voiceUrl,
    type: "popup",
    width: 380,
    height: 280,
    focused: true
  });

  voiceWindowId = popup.id;

  // Track when the popup window is closed.
  const onRemoved = (windowId) => {
    if (windowId === voiceWindowId) {
      voiceWindowId = null;
      chrome.windows.onRemoved.removeListener(onRemoved);
    }
  };

  chrome.windows.onRemoved.addListener(onRemoved);
}

async function closeVoicePopup() {
  if (voiceWindowId != null) {
    try {
      await chrome.windows.remove(voiceWindowId);
    } catch {}
    voiceWindowId = null;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const type = message?.type;

  // Ignore message types this listener doesn't own.
  const handled = [
    "GET_ACTIVE_TAB",
    "REQUEST_SITE_ACCESS",
    "GET_PAGE_CONTEXT",
    "START_VOICE_RECOGNITION",
    "STOP_VOICE_RECOGNITION"
  ];

  if (!handled.includes(type)) {
    return false;
  }

  (async () => {
    switch (type) {
      case "GET_ACTIVE_TAB": {
        const tab = await getActiveTab();
        sendResponse({
          ok: true,
          tab: serializeTab(tab)
        });
        break;
      }
      case "REQUEST_SITE_ACCESS": {
        const result = await requestSiteAccess(message.url, message.tabId);
        sendResponse(result);
        break;
      }
      case "GET_PAGE_CONTEXT": {
        const result = await readPageContext(message.url, message.tabId);
        sendResponse(result);
        break;
      }
      case "START_VOICE_RECOGNITION": {
        try {
          await openVoicePopup(message.language || "en");
          sendResponse({ ok: true });
        } catch (err) {
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : "Could not open voice input."
          });
        }
        break;
      }
      case "STOP_VOICE_RECOGNITION": {
        await closeVoicePopup();
        sendResponse({ ok: true });
        break;
      }
    }
  })();

  return true;
});

