// Worker protocol message types.
//
// Requests (workspace → worker):
export const REQUEST = Object.freeze({
  INIT: "INIT",
  LOAD_MODELS: "LOAD_MODELS",
  WARMUP: "WARMUP",
  OCR_IMAGE: "OCR_IMAGE",
  OCR_PAGE: "OCR_PAGE",
  CANCEL_JOB: "CANCEL_JOB",
  DISPOSE_DOCUMENT: "DISPOSE_DOCUMENT",
  DISPOSE_MODELS: "DISPOSE_MODELS",
});

// Responses (worker → workspace):
export const RESPONSE = Object.freeze({
  WORKER_READY: "WORKER_READY",
  ENGINE_SELECTED: "ENGINE_SELECTED",
  MODEL_LOAD_PROGRESS: "MODEL_LOAD_PROGRESS",
  MODEL_READY: "MODEL_READY",
  JOB_STARTED: "JOB_STARTED",
  PAGE_STAGE: "PAGE_STAGE",
  LINE_DETECTED: "LINE_DETECTED",
  LINE_RECOGNIZED: "LINE_RECOGNIZED",
  PAGE_DONE: "PAGE_DONE",
  JOB_CANCELLED: "JOB_CANCELLED",
  WORKER_ERROR: "WORKER_ERROR",
});

/**
 * Create a request message.
 * @param {string} type - One of REQUEST.
 * @param {string} jobId - Job identifier.
 * @param {Object} [payload] - Additional message data.
 * @returns {Object}
 */
export function createRequest(type, jobId, payload = {}) {
  return { type, jobId, ...payload };
}

/**
 * Create a response message.
 * @param {string} type - One of RESPONSE.
 * @param {string} jobId - Job identifier.
 * @param {Object} [payload] - Additional message data.
 * @returns {Object}
 */
export function createResponse(type, jobId, payload = {}) {
  return { type, jobId, ...payload };
}
