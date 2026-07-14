// Recognition diagnostics collector.

/**
 * @typedef {Object} RecognitionDiagnostics
 * @property {string} engine
 * @property {number} durationMs
 * @property {number} lineCount
 * @property {string[]} warnings
 */

export function createDiagnostics() {
  return {
    engine: "unknown",
    durationMs: 0,
    lineCount: 0,
    warnings: [],

    addWarning(msg) {
      this.warnings.push(msg);
    },

    toJSON() {
      return {
        engine: this.engine,
        durationMs: this.durationMs,
        lineCount: this.lineCount,
        warnings: [...this.warnings],
      };
    },
  };
}
