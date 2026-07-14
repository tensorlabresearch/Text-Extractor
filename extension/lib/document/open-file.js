// File open / drag-and-drop / clipboard paste handler.

import { computeFingerprint } from "./document-fingerprint.js";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];

/**
 * Set up the file open button and drag-and-drop on the document viewer.
 * @param {HTMLElement} button - The "Open File" button.
 * @param {Object} state - App state object.
 * @param {Function} onLoaded - Callback when a file is loaded.
 */
export function setupFileInput(button, state, onLoaded) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ACCEPTED_EXTENSIONS.join(",");
  input.style.display = "none";
  document.body.appendChild(input);

  button.addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (file) await loadFile(file, state, onLoaded);
    input.value = "";
  });

  // Drag and drop
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  document.addEventListener("drop", async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) await loadFile(file, state, onLoaded);
  });

  // Clipboard paste
  document.addEventListener("paste", async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          await loadFile(file, state, onLoaded);
          return;
        }
      }
    }
  });
}

/**
 * Load a file into state.
 * @param {File} file
 * @param {Object} state
 * @param {Function} onLoaded
 */
export async function loadFile(file, state, onLoaded) {
  if (!isAccepted(file)) {
    throw new Error(`Unsupported file type: ${file.type || file.name}`);
  }

  const bytes = await file.arrayBuffer();
  const fingerprint = await computeFingerprint(bytes);

  state.fileBytes = bytes;
  state.fileName = file.name;
  state.fileFingerprint = fingerprint;
  state.fileType = file.type === "application/pdf" ? "pdf" : "image";
  state.pages = [];
  state.results = new Map();
  state.currentPage = null;

  if (state.fileType === "image") {
    state.pageCount = 1;
    state.pages = [{ pageNumber: 1, status: "not-processed", source: "ocr" }];
    state.currentPage = 1;
  }

  await onLoaded();
}

/**
 * @param {File} file
 * @returns {boolean}
 */
function isAccepted(file) {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}
