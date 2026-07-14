// TrOCR small-printed recognizer backend using Transformers.js.
//
// Configures Transformers.js for local-only model loading before any
// model is loaded. Runtime order: WebGPU first, WASM fallback.

import { RecognizerBackend } from "./recognizer-backend.js";

export class TrocrRecognizer extends RecognizerBackend {
  _pipeline = null;
  _engine = null;

  async load(options) {
    const { env, pipeline } = await import("../../vendor/transformers/transformers.web.min.js");

    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.useBrowserCache = false;
    env.localModelPath = chrome.runtime.getURL("models/");
    env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL("lib/vendor/transformers/wasm/");

    const device = options.engine === "wasm" ? "cpu" : "webgpu";
    const dtype = "q8";

    try {
      this._pipeline = await pipeline("image-to-text", "trocr-small-printed", {
        dtype,
        device,
      });
      this._engine = options.engine || "webgpu";
    } catch (err) {
      if (device === "webgpu") {
        this._pipeline = await pipeline("image-to-text", "trocr-small-printed", {
          dtype,
          device: "cpu",
        });
        this._engine = "wasm";
      } else {
        throw err;
      }
    }
  }

  async recognize(crops, _options, signal) {
    if (!this._pipeline) throw new Error("Recognizer not loaded");

    const results = [];
    for (const crop of crops) {
      if (signal?.aborted) throw new Error("Aborted");

      let imageData;
      if (crop instanceof ImageData) {
        imageData = crop;
      } else if (crop instanceof ImageBitmap) {
        const canvas = new OffscreenCanvas(crop.width, crop.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(crop, 0, 0);
        imageData = ctx.getImageData(0, 0, crop.width, crop.height);
      } else if (crop instanceof OffscreenCanvas) {
        const ctx = crop.getContext("2d");
        imageData = ctx.getImageData(0, 0, crop.width, crop.height);
      } else {
        throw new Error("Unsupported crop type");
      }

      const output = await this._pipeline(imageData, {
        max_new_tokens: 96,
        num_beams: 1,
        do_sample: false,
      });

      results.push({
        text: String(output?.[0]?.generated_text || ""),
        score: null,
        diagnostics: { engine: this._engine },
      });
    }

    return results;
  }

  get engine() {
    return this._engine;
  }

  async dispose() {
    this._pipeline = null;
    this._engine = null;
  }
}
