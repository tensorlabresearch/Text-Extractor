import { describe, it, expect } from "vitest";
import { createJobQueue } from "../../extension/lib/app/job-queue.js";

describe("job-queue", () => {
  it("runs jobs sequentially", async () => {
    const queue = createJobQueue();
    const results = [];

    queue.enqueue(async () => { results.push("a"); });
    queue.enqueue(async () => { results.push("b"); });
    queue.enqueue(async () => { results.push("c"); });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(results).toEqual(["a", "b", "c"]);
  });

  it("cancels pending jobs", async () => {
    const queue = createJobQueue();
    const results = [];

    queue.enqueue(async () => { results.push("a"); });
    queue.enqueue(async () => { results.push("b"); });
    queue.enqueue(async () => { results.push("c"); });

    queue.cancel();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(results).toEqual(["a"]);
  });
});
