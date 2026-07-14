// PP-OCRv5 mobile detector ONNX backend.
//
// Uses direct ONNX Runtime Web (not Transformers.js) for the detector.

import { DetectorBackend } from "./detector-backend.js";
import { preprocessForDetector } from "../../image/preprocessing.js";
import { dbPostprocess } from "./db-postprocess.js";

export class Ppocrv5Detector extends DetectorBackend {
  _session = null;
  _engine = null;
  _ort = null;

  async load(options) {
    const ort = await import("../../vendor/transformers/ort.webgpu.bundle.min.mjs");
    this._ort = ort;

    const modelUrl = options.modelPath;
    if (!modelUrl) throw new Error("modelPath required");

    const tryProviders = options.executionProvider === "wasm"
      ? ["wasm"]
      : options.executionProvider === "webgpu"
        ? ["webgpu"]
        : ["webgpu", "wasm"];

    let lastError = null;
    for (const provider of tryProviders) {
      try {
        const session = await ort.InferenceSession.create(modelUrl, {
          executionProviders: provider === "webgpu"
            ? [{ name: "webgpu" }]
            : [{ name: "wasm", threads: options.numThreads || 2 }],
        });
        this._session = session;
        this._engine = provider;
        return;
      } catch (err) {
        lastError = err;
      }
    }
    throw new Error(`Failed to load detector: ${lastError}`);
  }

  async detect(image, _options, _signal) {
    if (!this._session) throw new Error("Detector not loaded");

    const { tensor, width, height, origWidth, origHeight } = preprocessForDetector(image);

    const inputName = this._session.inputNames[0];
    const tensor3d = new this._ort.Tensor("float32", tensor, [1, 3, height, width]);
    const feeds = { [inputName]: tensor3d };

    const results = await this._session.run(feeds);
    const outputName = this._session.outputNames[0];
    const output = results[outputName];
    const probMap = output.data;

    const outH = output.dims[2];
    const outW = output.dims[3];

    const detections = dbPostprocess(
      probMap,
      outW,
      outH,
      origWidth,
      origHeight
    );

    return detections.map((det, i) => ({
      id: `region-${i}`,
      polygon: det.polygon,
      boundingBox: det.boundingBox,
      detectorScore: det.score,
      estimatedAngle: 0,
    }));
  }

  get engine() {
    return this._engine;
  }

  async dispose() {
    if (this._session) {
      try { await this._session.release(); } catch (_) {}
      this._session = null;
    }
  }
}
