import { describe, it, expect } from "vitest";
import { nms } from "../../extension/lib/ocr/detector/nms.js";

describe("nms", () => {
  it("keeps non-overlapping detections", () => {
    const detections = [
      { boundingBox: [0, 0, 10, 10], detectorScore: 0.9 },
      { boundingBox: [50, 50, 10, 10], detectorScore: 0.8 },
    ];
    const kept = nms(detections, 0.4);
    expect(kept).toHaveLength(2);
  });

  it("suppresses overlapping detections", () => {
    const detections = [
      { boundingBox: [0, 0, 10, 10], detectorScore: 0.9 },
      { boundingBox: [1, 1, 10, 10], detectorScore: 0.8 },
    ];
    const kept = nms(detections, 0.4);
    expect(kept).toEqual([0]);
  });

  it("keeps higher-scoring detection", () => {
    const detections = [
      { boundingBox: [0, 0, 10, 10], detectorScore: 0.7 },
      { boundingBox: [1, 1, 10, 10], detectorScore: 0.9 },
    ];
    const kept = nms(detections, 0.4);
    expect(kept).toEqual([1]);
  });
});
