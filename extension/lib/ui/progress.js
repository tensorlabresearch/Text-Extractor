// Progress bar controller.

/**
 * Create a progress controller.
 * @param {HTMLElement} textEl
 * @param {HTMLElement} barEl
 */
export function createProgress(textEl, barEl) {
  return {
    setText(msg) {
      textEl.textContent = msg;
    },
    setProgress(fraction) {
      const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
      barEl.style.width = `${pct}%`;
    },
    reset() {
      textEl.textContent = "Ready";
      barEl.style.width = "0%";
    },
  };
}
