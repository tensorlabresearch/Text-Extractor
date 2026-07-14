// Error types for the OCR pipeline.

export class OcrError extends Error {
  /**
   * @param {string} message
   * @param {Object} [details]
   */
  constructor(message, details = {}) {
    super(message);
    this.name = "OcrError";
    this.details = details;
  }
}

export class ModelLoadError extends OcrError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = "ModelLoadError";
  }
}

export class EngineUnavailableError extends OcrError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = "EngineUnavailableError";
  }
}

export class CancelledError extends OcrError {
  constructor(message = "Job cancelled") {
    super(message);
    this.name = "CancelledError";
  }
}

/**
 * Ensure an error is serializable for worker messaging.
 * @param {unknown} err
 * @returns {{ message: string, name: string, details?: Object }}
 */
export function serializeError(err) {
  if (err instanceof Error) {
    return { message: err.message, name: err.name, details: err.details };
  }
  return { message: String(err), name: "Error" };
}
