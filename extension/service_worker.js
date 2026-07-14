// Background service worker for Text Extractor.
//
// Remains thin: opens or focuses the workspace tab, initializes default
// settings in chrome.storage.local, and optionally handles download requests.
// Never loads PDF.js, Transformers.js, ONNX Runtime, or model files.
// Never retains current-job state in global variables.

const WORKSPACE_URL = chrome.runtime.getURL("workspace.html");

const DEFAULT_SETTINGS = {
  engine: "auto",
  quality: "document",
  detectorThreshold: 0.3,
  boxThreshold: 0.6,
  exportFormat: "txt",
  restoreSessions: false,
  numThreads: "auto"
};

const SETTINGS_KEY = "settings";

chrome.action.onClicked.addListener(async () => {
  await openOrFocusWorkspace();
});

async function openOrFocusWorkspace() {
  const existing = await chrome.tabs.query({ url: WORKSPACE_URL });
  if (existing.length > 0) {
    const tab = existing[0];
    if (Number.isInteger(tab.windowId)) {
      await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {});
    }
    await chrome.tabs.update(tab.id, { active: true });
    return;
  }
  await chrome.tabs.create({ url: WORKSPACE_URL, active: true });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return;

  if (message.type === "get-settings") {
    getSettings()
      .then((settings) => sendResponse({ ok: true, settings }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "save-settings") {
    saveSettings(message.settings)
      .then((settings) => sendResponse({ ok: true, settings }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }
});

export async function getSettings() {
  const localStorage = globalThis.chrome?.storage?.local;
  if (!localStorage) return { ...DEFAULT_SETTINGS };
  const { [SETTINGS_KEY]: stored } = await localStorage.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === "object" ? stored : {}) };
}

export async function saveSettings(partial) {
  if (!partial || typeof partial !== "object") {
    throw new Error("Settings payload required");
  }
  const current = await getSettings();
  const merged = { ...current, ...partial };
  const localStorage = globalThis.chrome?.storage?.local;
  if (!localStorage) {
    throw new Error("Storage API unavailable in service worker");
  }
  await localStorage.set({ [SETTINGS_KEY]: merged });
  return merged;
}

// Initialize default settings on install/update.
chrome.runtime.onInstalled.addListener(async () => {
  try {
    await getSettings();
  } catch (_) {
    // storage not available in some test contexts
  }
});
