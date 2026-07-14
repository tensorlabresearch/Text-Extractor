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
    env.localModelPath = options.localModelPath;
    env.backends.onnx.wasm.wasmPaths = options.wasmPaths;

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

      let canvas;
      if (crop instanceof OffscreenCanvas) {
        canvas = crop;
      } else if (crop instanceof ImageBitmap) {
        canvas = new OffscreenCanvas(crop.width, crop.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(crop, 0, 0);
      } else if (crop instanceof ImageData) {
        canvas = new OffscreenCanvas(crop.width, crop.height);
        const ctx = canvas.getContext("2d");
        ctx.putImageData(crop, 0, 0);
      } else {
        throw new Error("Unsupported crop type");
      }

      const output = await this._pipeline(canvas, {
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
