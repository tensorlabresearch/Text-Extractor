// Workspace entry point for Text Extractor.
//
// Owns the document session, page queue, OCR results, user edits,
// export state, and worker lifecycle. The service worker never holds
// this state — it only opens/focuses this tab.

import { createState } from "./lib/app/state.js";
import { createJobQueue } from "./lib/app/job-queue.js";
import { createWorkerClient } from "./lib/ocr/worker-client.js";
import { createDocumentViewer } from "./lib/ui/document-viewer.js";
import { createPageOverlay } from "./lib/ui/page-overlay.js";
import { createPageList } from "./lib/ui/page-list.js";
import { createResultEditor } from "./lib/ui/result-editor.js";
import { createProgress } from "./lib/ui/progress.js";
import { setupFileInput } from "./lib/document/open-file.js";

const state = createState();
const queue = createJobQueue();
const workerClient = createWorkerClient();

const viewer = createDocumentViewer(document.getElementById("page-canvas"));
const overlay = createPageOverlay(document.getElementById("overlay"));
const pageList = createPageList(document.getElementById("pages"));
const resultEditor = createResultEditor(document.getElementById("lines"));
const progress = createProgress(
  document.getElementById("progress-text"),
  document.getElementById("progress-bar")
);

// Toolbar wiring
setupFileInput(document.getElementById("btn-open"), state, onPageLoaded);

document.getElementById("btn-start").addEventListener("click", startOCR);
document.getElementById("btn-cancel").addEventListener("click", cancelOCR);
document.getElementById("btn-settings").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
});

async function onPageLoaded() {
  pageList.render(state);
  progress.setText(`Loaded ${state.pageCount} page(s)`);
}

async function startOCR() {
  const btnStart = document.getElementById("btn-start");
  const btnCancel = document.getElementById("btn-cancel");
  btnStart.disabled = true;
  btnCancel.disabled = false;

  try {
    await workerClient.init();
    // TODO: implement page pipeline
    progress.setText("OCR not yet implemented — Phase 0 spike pending");
  } finally {
    btnStart.disabled = false;
    btnCancel.disabled = true;
  }
}

function cancelOCR() {
  queue.cancel();
  progress.setText("Cancelled");
  document.getElementById("btn-start").disabled = false;
  document.getElementById("btn-cancel").disabled = true;
}
