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
import { createPdfController } from "./lib/pdf/pdf-controller.js";
import { getNativeTextItems, itemsToPlainText } from "./lib/pdf/native-text.js";
import { classifyTextLayer } from "./lib/pdf/text-layer-classifier.js";
import { renderPage, dpiToScale } from "./lib/pdf/render-page.js";
import { decodeImage } from "./lib/image/decode.js";
import { exportTxt, exportMarkdown, exportJson } from "./lib/app/exports.js";
import { RESPONSE } from "./lib/ocr/protocol.js";

const state = createState();
const queue = createJobQueue();
const workerClient = createWorkerClient();
const pdfController = createPdfController();

const viewer = createDocumentViewer(document.getElementById("page-canvas"));
const overlay = createPageOverlay(document.getElementById("overlay"));
const pageList = createPageList(document.getElementById("pages"));
const resultEditor = createResultEditor(document.getElementById("lines"));
const progress = createProgress(
  document.getElementById("progress-text"),
  document.getElementById("progress-bar")
);

let currentImageBitmap = null;
let allPageResults = [];

setupFileInput(document.getElementById("btn-open"), state, onPageLoaded);

document.getElementById("btn-start").addEventListener("click", startOCR);
document.getElementById("btn-cancel").addEventListener("click", cancelOCR);
document.getElementById("btn-copy").addEventListener("click", copyText);
document.getElementById("btn-export").addEventListener("click", exportResults);
document.getElementById("btn-rotate").addEventListener("click", rotateCurrentPage);
document.getElementById("btn-settings").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
});

document.getElementById("select-mode").addEventListener("change", (e) => {
  state.mode = e.target.value;
});
document.getElementById("select-quality").addEventListener("change", (e) => {
  state.quality = e.target.value;
});
document.getElementById("select-engine").addEventListener("change", (e) => {
  state.engine = e.target.value;
});

async function onPageLoaded() {
  allPageResults = [];
  progress.reset();

  if (state.fileType === "pdf") {
    try {
      const result = await pdfController.open(state.fileBytes);
      state.pageCount = result.pageCount;
      state.pages = [];
      for (let i = 1; i <= result.pageCount; i++) {
        state.pages.push({ pageNumber: i, status: "not-processed", source: "auto" });
      }
      state.currentPage = 1;
      await renderPdfPage(1);
    } catch (err) {
      progress.setText("Error opening PDF: " + String(err?.message || err));
    }
  } else if (state.fileType === "image") {
    try {
      currentImageBitmap = await decodeImage(state.fileBytes, getMimeType(state.fileName));
      state.pageCount = 1;
      state.pages = [{ pageNumber: 1, status: "not-processed", source: "ocr" }];
      state.currentPage = 1;
      viewer.render(currentImageBitmap);
    } catch (err) {
      progress.setText("Error loading image: " + String(err?.message || err));
    }
  }

  pageList.render(state);
  progress.setText(`Loaded ${state.pageCount} page(s)`);
}

async function renderPdfPage(pageNumber) {
  try {
    const page = await pdfController.getPage(pageNumber);
    const dpi = state.quality === "fast" ? 150 : state.quality === "high-res" ? 300 : 200;
    const scale = dpiToScale(dpi);
    const canvas = document.getElementById("page-canvas");
    const { width: _w, height: _h } = await renderPage(page, scale, canvas);

    const viewport = page.getViewport({ scale });
    const items = await getNativeTextItems(page);

    if (items.length > 0 && state.mode !== "forced-ocr") {
      const classification = classifyTextLayer(items, { width: viewport.width, height: viewport.height });
      const pageEntry = state.pages.find((p) => p.pageNumber === pageNumber);
      if (pageEntry) {
        pageEntry.source = state.mode === "native" ? "native" : classification.source;
        pageEntry.status = pageEntry.source === "native" ? "native" : "not-processed";
      }
    }

    pageList.render(state);
  } catch (err) {
    progress.setText("Error rendering page: " + String(err?.message || err));
  }
}

async function startOCR() {
  const btnStart = document.getElementById("btn-start");
  const btnCancel = document.getElementById("btn-cancel");
  btnStart.disabled = true;
  btnCancel.disabled = false;

  try {
    progress.setText("Loading models...");
    await workerClient.init();

    workerClient.on(RESPONSE.ENGINE_SELECTED, (msg) => {
      updateDiagnostics({ detectorEngine: msg.engine });
    });
    workerClient.on(RESPONSE.MODEL_READY, (msg) => {
      updateDiagnostics({ detectorEngine: msg.detectorEngine, recognizerEngine: msg.recognizerEngine });
      progress.setText("Models loaded. Starting OCR...");
    });
    workerClient.on(RESPONSE.WORKER_ERROR, (msg) => {
      progress.setText("Error: " + msg.error);
    });

    await workerClient.loadModels({ engine: state.engine });
    progress.setText("Models loaded. Processing...");

    if (state.fileType === "image") {
      await processImagePage();
    } else if (state.fileType === "pdf") {
      await processPdfPages();
    }
  } catch (err) {
    progress.setText("Error: " + String(err?.message || err));
  } finally {
    btnStart.disabled = false;
    btnCancel.disabled = true;
  }
}

async function processImagePage() {
  progress.setText("Detecting text regions...");
  progress.setProgress(0.1);

  const result = await workerClient.ocrImage(currentImageBitmap, {
    width: currentImageBitmap.width,
    height: currentImageBitmap.height,
    pageNumber: 1,
    source: "ocr",
  });

  allPageResults = [result.result];
  displayResults(result.result);
  progress.setText("OCR complete. " + result.result.lines.length + " lines found.");
  progress.setProgress(1);

  overlay.render(
    result.result.lines.map((l) => ({ id: l.id, polygon: l.polygon })),
    { width: currentImageBitmap.width, height: currentImageBitmap.height }
  );
}

async function processPdfPages() {
  const pagesToProcess = getPagesToProcess();
  const total = pagesToProcess.length;

  for (let i = 0; i < total; i++) {
    const pageNum = pagesToProcess[i];
    const pageEntry = state.pages.find((p) => p.pageNumber === pageNum);
    if (!pageEntry) continue;

    if (pageEntry.source === "native" && state.mode !== "forced-ocr") {
      progress.setText(`Page ${pageNum}: extracting native text...`);
      const page = await pdfController.getPage(pageNum);
      const items = await getNativeTextItems(page);
      const text = itemsToPlainText(items);
      const viewport = page.getViewport({ scale: 1 });
      const result = {
        pageNumber: pageNum,
        source: "native",
        width: viewport.width,
        height: viewport.height,
        lines: [{ id: "native-1", text, polygon: [], readingOrder: 0, detectorScore: null, recognitionScore: null, userEdited: false, diagnostics: {} }],
        plainText: text,
        diagnostics: { engine: "native" },
      };
      allPageResults.push(result);
      pageEntry.status = "native";
      pageList.render(state);
    } else {
      progress.setText(`Page ${pageNum}: rendering...`);
      progress.setProgress(i / total);

      const page = await pdfController.getPage(pageNum);
      const dpi = state.quality === "fast" ? 150 : state.quality === "high-res" ? 300 : 200;
      const scale = dpiToScale(dpi);
      const canvas = new OffscreenCanvas(1, 1);
      const { width, height } = await renderPage(page, scale, canvas);
      const imageData = canvas.getContext("2d").getImageData(0, 0, width, height);

      progress.setText(`Page ${pageNum}: OCR...`);
      progress.setProgress((i + 0.5) / total);

      const result = await workerClient.ocrImage(imageData, {
        width,
        height,
        pageNumber: pageNum,
        source: "ocr",
      });

      allPageResults.push(result.result);
      pageEntry.status = "complete";
      pageList.render(state);

      if (pageNum === state.currentPage) {
        displayResults(result.result);
        overlay.render(
          result.result.lines.map((l) => ({ id: l.id, polygon: l.polygon })),
          { width, height }
        );
      }

      page.cleanup();
    }
  }

  progress.setText(`OCR complete. ${allPageResults.length} page(s) processed.`);
  progress.setProgress(1);
}

function getPagesToProcess() {
  const rangeInput = document.getElementById("page-range").value.trim();
  if (!rangeInput) return state.pages.map((p) => p.pageNumber);

  const pages = [];
  const parts = rangeInput.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let i = start; i <= end; i++) pages.push(i);
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) pages.push(num);
    }
  }
  return pages.filter((p) => p >= 1 && p <= state.pageCount);
}

function displayResults(pageResult) {
  resultEditor.render(pageResult.lines, (id, newText) => {
    const line = pageResult.lines.find((l) => l.id === id);
    if (line) {
      line.text = newText;
      line.userEdited = true;
    }
  });
}

function cancelOCR() {
  workerClient.cancel();
  queue.cancel();
  progress.setText("Cancelled");
  document.getElementById("btn-start").disabled = false;
  document.getElementById("btn-cancel").disabled = true;
}

function copyText() {
  const text = allPageResults
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map((p) => p.plainText)
    .join("\n\n");
  navigator.clipboard.writeText(text).then(() => {
    progress.setText("Copied to clipboard");
  }).catch(() => {
    progress.setText("Copy failed");
  });
}

function exportResults() {
  const format = document.getElementById("select-export").value;
  const sorted = allPageResults.slice().sort((a, b) => a.pageNumber - b.pageNumber);
  const baseName = (state.fileName || "output").replace(/\.[^.]+$/, "");

  let content, ext, mime;
  switch (format) {
    case "json":
      content = exportJson(sorted);
      ext = "json";
      mime = "application/json";
      break;
    case "markdown":
      content = exportMarkdown(sorted);
      ext = "md";
      mime = "text/markdown";
      break;
    default:
      content = exportTxt(sorted);
      ext = "txt";
      mime = "text/plain";
      break;
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
  progress.setText(`Exported as ${ext.toUpperCase()}`);
}

function rotateCurrentPage() {
  if (!currentImageBitmap) return;
  const canvas = new OffscreenCanvas(currentImageBitmap.height, currentImageBitmap.width);
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(currentImageBitmap, -currentImageBitmap.width / 2, -currentImageBitmap.height / 2);
  currentImageBitmap = canvas.transferToImageBitmap();
  viewer.render(currentImageBitmap);
}

function updateDiagnostics(info) {
  const el = document.getElementById("diagnostics-content");
  const current = el.textContent || "";
  const lines = current.split("\n").filter(Boolean);
  for (const [key, value] of Object.entries(info)) {
    const prefix = key + ":";
    const existingIdx = lines.findIndex((l) => l.startsWith(prefix));
    if (existingIdx >= 0) {
      lines[existingIdx] = `${key}: ${value}`;
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  el.textContent = lines.join("\n");
}

function getMimeType(fileName) {
  const ext = (fileName || "").toLowerCase().split(".").pop();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    default: return "image/png";
  }
}
