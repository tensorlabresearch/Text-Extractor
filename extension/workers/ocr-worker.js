// OCR module worker for Local PDF OCR.
//
// Contains both the PP-OCR detector and TrOCR recognizer in a single worker
// to avoid transferring line crops between workers, avoid multiple ONNX
// Runtime environments, avoid competing WebGPU contexts, and simplify
// cancellation and resource cleanup.
//
// ONNX Runtime's internal proxy-worker option is disabled because it does
// not work with the WebGPU execution provider.

import { handleMessage } from "../lib/ocr/worker-client.js";

self.onmessage = (event) => {
  handleMessage(event.data, self.postMessage.bind(self));
};
