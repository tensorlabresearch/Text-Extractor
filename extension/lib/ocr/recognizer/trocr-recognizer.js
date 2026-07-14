// TrOCR small-printed recognizer backend using Transformers.js.
//
// Configures Transformers.js for local-only model loading before any
// model is loaded. Runtime order: WebGPU first, WASM fallback.

import { RecognizerBackend } from "./recognizer-backend.js";

export class TrocrRecognizer extends RecognizerBackend {
  /** @type {any|null} */
  _pipeline = null;
  /** @type {"webgpu"|"wasm"|null} */
  _engine = null;

  /**
   * @param {Object} options
   * @param {string} options.modelPath - Extension URL to model directory.
   * @param {"auto"|"webgpu"|"wasm"} [options.engine]
   */
  async load(options) {
    // TODO: implement in Phase 4
    //
    // import { env, pipeline } from "../vendor/transformers/transformers.js";
    // env.allowRemoteModels = false;
    // env.allowLocalModels = true;
    // env.useBrowserCache = false;
    // env.localModelPath = chrome.runtime.getURL("models/");
    // env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL("lib/vendor/onnxruntime/");
    //
    // this._pipeline = await pipeline("image-to-text", "trocr-small-printed", {
    //   dtype: "q8",
    //   device: options.engine === "wasm" ? "cpu" : "webgpu",
    // });
    throw new Error("TrOCR recognizer not yet implemented — Phase 4");
  }

  /**
   * @param {Array<ImageBitmap|ImageData>} crops
   * @param {Object} options
   * @param {AbortSignal} signal
   * @returns {Promise<import("./recognizer-backend.js").RecognitionResult[]>}
   */
  async recognize(crops, options, signal) {
    if (!this._pipeline) throw new Error("Recognizer not loaded");

    const results = [];
    for (const crop of crops) {
      if (signal?.aborted) throw new Error("Aborted");

      const output = await this._pipeline(crop, {
        max_new_tokens: 96,
        num_beams: 1,
        do_sample: false,
      });

      results.push({
        text: String(output?.[0]?.generated_text || ""),
        score: null, // Do not invent a confidence score
        diagnostics: { engine: this._engine },
      });
    }

    return results;
  }

  async dispose() {
    this._pipeline = null;
    this._engine = null;
  }
}
