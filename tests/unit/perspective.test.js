import { describe, it, expect } from "vitest";
import { computeCropDimensions } from "../../extension/lib/image/perspective.js";

describe("perspective", () => {
  it("computes crop dimensions for a rectangle", () => {
    const polygon = [[0, 0], [100, 0], [100, 20], [0, 20]];
    const dims = computeCropDimensions(polygon);
    expect(dims.width).toBe(100);
    expect(dims.height).toBe(20);
  });

  it("computes crop dimensions for a parallelogram", () => {
    const polygon = [[0, 0], [100, 10], [110, 30], [10, 20]];
    const dims = computeCropDimensions(polygon);
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });
});
