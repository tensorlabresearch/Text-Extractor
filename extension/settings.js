// Settings page for Text Extractor.

const FIELDS = [
  "engine",
  "numThreads",
  "detectorThreshold",
  "boxThreshold",
  "exportFormat",
  "restoreSessions",
];

async function getSettings() {
  const response = await chrome.runtime.sendMessage({ type: "get-settings" });
  if (!response?.ok) throw new Error(response?.error || "Failed to load settings");
  return response.settings;
}

async function saveSettings(settings) {
  const response = await chrome.runtime.sendMessage({ type: "save-settings", settings });
  if (!response?.ok) throw new Error(response?.error || "Failed to save settings");
  return response.settings;
}

async function init() {
  const settings = await getSettings();

  for (const key of FIELDS) {
    const el = document.getElementById(`setting-${key}`);
    if (!el) continue;
    if (el.type === "checkbox") {
      el.checked = !!settings[key];
    } else {
      el.value = String(settings[key] ?? "");
    }
  }

  document.getElementById("settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {};
    for (const key of FIELDS) {
      const el = document.getElementById(`setting-${key}`);
      if (!el) continue;
      if (el.type === "checkbox") {
        updated[key] = el.checked;
      } else if (el.type === "number") {
        updated[key] = parseFloat(el.value);
      } else {
        updated[key] = el.value;
      }
    }
    await saveSettings(updated);
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = "Saved!";
    setTimeout(() => { btn.textContent = "Save"; }, 2000);
  });
}

init().catch((err) => {
  console.error("Settings init failed:", err);
});
