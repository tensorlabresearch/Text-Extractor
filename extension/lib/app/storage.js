// chrome.storage.local wrapper for user settings.

const SETTINGS_KEY = "settings";

export async function getSettings() {
  const localStorage = globalThis.chrome?.storage?.local;
  if (!localStorage) return {};
  const { [SETTINGS_KEY]: stored } = await localStorage.get(SETTINGS_KEY);
  return stored && typeof stored === "object" ? stored : {};
}

export async function saveSettings(partial) {
  const current = await getSettings();
  const merged = { ...current, ...partial };
  const localStorage = globalThis.chrome?.storage?.local;
  if (!localStorage) throw new Error("Storage API unavailable");
  await localStorage.set({ [SETTINGS_KEY]: merged });
  return merged;
}
