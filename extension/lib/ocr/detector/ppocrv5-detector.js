// PP-OCRv5 mobile detector ONNX backend.
//
// Uses direct ONNX Runtime Web (not Transformers.js) for the detector.

import { DetectorBackend } from "./detector-backend.js";
import { preprocessForDetector } from "../../image/preprocessing.js";

export class Ppocrv5Detector extends DetectorBackend {
  /** @type {import("onnxruntime-web").InferenceSession|null} */
  _session = null;

  /**
   * @param {Object} options
   * @param {string} options.modelPath - Extension URL to inference.onnx
   * @param {"webgpu"|"wasm"} [options.executionProvider]
   */
  async load(_options) {
    // TODO: implement in Phase 3
    // Load ONNX session with the specified execution provider
    throw new Error("PP-OCRv5 detector not yet implemented — Phase 3");
  }

  /**
   * @param {ImageData|ImageBitmap|OffscreenCanvas} image
   * @param {Object} options
   * @param {AbortSignal} signal
   * @returns {Promise<import("./detector-backend.js").TextRegion[]>}
   */
  async detect(image, _options, _signal) {
    if (!this._session) throw new Error("Detector not loaded");
    const _preprocessed = preprocessForDetector(image);
    // TODO: run inference and postprocess in Phase 3
    throw new Error("Detection not yet implemented — Phase 3");
  }

  async dispose() {
    if (this._session) {
      try { await this._session.release(); } catch (_) {}
      this._session = null;
    }
  }
}
