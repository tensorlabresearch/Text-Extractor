// Worker client — manages the OCR worker lifecycle from the workspace side.
//
// Creates the worker, sends protocol messages, routes responses to
// registered listeners, and handles cancellation and termination.

import { REQUEST, RESPONSE, createRequest } from "./protocol.js";

/**
 * @typedef {Object} WorkerClient
 * @property {() => Promise<void>} init - Boot the worker.
 * @property {(options: Object) => Promise<void>} loadModels - Load detector and recognizer.
 * @property {(image: ImageBitmap|ImageData, options: Object, signal: AbortSignal) => Promise<Object>} ocrImage - OCR a single image.
 * @property {() => void} cancel - Cancel the current job.
 * @property {() => Promise<void>} dispose - Terminate and clean up.
 * @property {(type: string, handler: Function) => void} on - Register an event handler.
 */

/**
 * Create a worker client.
 * @returns {WorkerClient}
 */
export function createWorkerClient() {
  let worker = null;
  let currentJobId = null;
  const listeners = new Map();

  /**
   * @param {string} type
   * @param {Function} handler
   */
  function on(type, handler) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  }

  function emit(type, data) {
    const handlers = listeners.get(type);
    if (handlers) for (const h of handlers) h(data);
  }

  function handleWorkerMessage(event) {
    const msg = event.data;
    if (!msg || !msg.type) return;
    emit(msg.type, msg);
  }

  function handleWorkerError(event) {
    emit(RESPONSE.WORKER_ERROR, { error: String(event.message || event) });
  }

  return {
    on,

    async init() {
      if (worker) return;
      worker = new Worker(chrome.runtime.getURL("workers/ocr-worker.js"), { type: "module" });
      worker.onmessage = handleWorkerMessage;
      worker.onerror = handleWorkerError;
    },

    async loadModels(options = {}) {
      if (!worker) throw new Error("Worker not initialized");
      currentJobId = makeJobId();
      const payload = {
        ...options,
        detectorModelPath: chrome.runtime.getURL("models/ppocrv5-mobile-det/inference.onnx"),
        modelsBasePath: chrome.runtime.getURL("models/"),
        wasmPaths: chrome.runtime.getURL("lib/vendor/transformers/wasm/"),
      };
      return postAndAwait(REQUEST.LOAD_MODELS, currentJobId, payload, RESPONSE.MODEL_READY);
    },

    async ocrImage(image, options = {}, signal) {
      if (!worker) throw new Error("Worker not initialized");
      currentJobId = makeJobId();
      return postAndAwait(REQUEST.OCR_IMAGE, currentJobId, { image, ...options }, RESPONSE.PAGE_DONE, signal);
    },

    cancel() {
      if (!worker || !currentJobId) return;
      worker.postMessage(createRequest(REQUEST.CANCEL_JOB, currentJobId));
    },

    async dispose() {
      if (!worker) return;
      try {
        worker.postMessage(createRequest(REQUEST.DISPOSE_MODELS, currentJobId || ""));
      } catch (_) {}
      worker.terminate();
      worker = null;
      currentJobId = null;
    },
  };

  function makeJobId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  async function postAndAwait(reqType, jobId, payload, expectedResponse, signal) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for ${expectedResponse}`));
      }, 120000);

      function cleanup() {
        clearTimeout(timeout);
        listeners.delete(expectedResponse, handler);
        if (signal) signal.removeEventListener("abort", onAbort);
      }

      function handler(data) {
        if (data.jobId !== jobId) return;
        cleanup();
        if (data.type === RESPONSE.WORKER_ERROR) {
          reject(new Error(data.error));
        } else {
          resolve(data);
        }
      }

      function onAbort() {
        cleanup();
        reject(new Error("Aborted"));
      }

      on(expectedResponse, handler);
      on(RESPONSE.WORKER_ERROR, handler);
      if (signal) signal.addEventListener("abort", onAbort);

      worker.postMessage(createRequest(reqType, jobId, payload));
    });
  }
}

/**
 * Worker-side message handler (imported by ocr-worker.js).
 *
 * @param {Object} message - Incoming request message.
 * @param {Function} postMessage - Function to send responses back.
 */
let _detector = null;
let _recognizer = null;
let _cancelled = false;

export async function handleMessage(message, postMessage) {
  if (!message || !message.type) return;

  const { type, jobId } = message;

  switch (type) {
    case REQUEST.INIT:
      postMessage({ type: RESPONSE.WORKER_READY, jobId });
      break;

    case REQUEST.LOAD_MODELS: {
      try {
        const { Ppocrv5Detector } = await import("./detector/ppocrv5-detector.js");
        const { TrocrRecognizer } = await import("./recognizer/trocr-recognizer.js");

        _detector = new Ppocrv5Detector();
        await _detector.load({
          modelPath: message.detectorModelPath,
          executionProvider: message.engine || "auto",
          wasmPaths: message.wasmPaths,
        });
        postMessage({ type: RESPONSE.ENGINE_SELECTED, jobId, engine: _detector.engine });

        _recognizer = new TrocrRecognizer();
        await _recognizer.load({
          engine: message.engine || "auto",
          localModelPath: message.modelsBasePath,
          wasmPaths: message.wasmPaths,
        });
        postMessage({ type: RESPONSE.MODEL_READY, jobId, detectorEngine: _detector.engine, recognizerEngine: _recognizer.engine });
      } catch (err) {
        postMessage({ type: RESPONSE.WORKER_ERROR, jobId, error: String(err?.message || err) });
      }
      break;
    }

    case REQUEST.OCR_IMAGE: {
      if (!_detector || !_recognizer) {
        postMessage({ type: RESPONSE.WORKER_ERROR, jobId, error: "Models not loaded" });
        break;
      }
      _cancelled = false;
      try {
        const { runPagePipeline } = await import("./pipeline/page-pipeline.js");
        const result = await runPagePipeline({
          detector: _detector,
          recognizer: _recognizer,
          image: message.image,
          options: { ...message, pageNumber: 1, source: "ocr" },
          signal: { aborted: _cancelled },
        });
        postMessage({ type: RESPONSE.PAGE_DONE, jobId, result });
      } catch (err) {
        if (_cancelled) {
          postMessage({ type: RESPONSE.JOB_CANCELLED, jobId });
        } else {
          postMessage({ type: RESPONSE.WORKER_ERROR, jobId, error: String(err?.message || err) });
        }
      }
      break;
    }

    case REQUEST.CANCEL_JOB:
      _cancelled = true;
      postMessage({ type: RESPONSE.JOB_CANCELLED, jobId });
      break;

    case REQUEST.DISPOSE_MODELS:
      if (_detector) { try { await _detector.dispose(); } catch (_) {} _detector = null; }
      if (_recognizer) { try { await _recognizer.dispose(); } catch (_) {} _recognizer = null; }
      break;

    default:
      break;
  }
}
