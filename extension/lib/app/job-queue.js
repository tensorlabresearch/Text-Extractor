// Sequential job queue with cancellation support.
//
// One OCR inference job runs at a time. Current visible page gets highest
// priority. Page-range jobs are processed sequentially.

export function createJobQueue() {
  /** @type {Array<{ run: Function, signal: AbortSignal }>} */
  const queue = [];
  let running = false;
  let currentController = null;

  async function process() {
    if (running) return;
    running = true;
    while (queue.length > 0) {
      const job = queue.shift();
      currentController = new AbortController();
      try {
        await job.run(currentController.signal);
      } catch (err) {
        if (err?.name !== "AbortError") console.error("Job failed:", err);
      }
      currentController = null;
    }
    running = false;
  }

  return {
    /**
     * Enqueue a job.
     * @param {(signal: AbortSignal) => Promise<void>} run
     */
    enqueue(run) {
      queue.push({ run });
      process();
    },

    cancel() {
      if (currentController) currentController.abort();
      queue.length = 0;
    },

    get isRunning() {
      return running;
    },

    get pendingCount() {
      return queue.length;
    },
  };
}
