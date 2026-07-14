import { describe, it, expect } from "vitest";
import { assignReadingOrder } from "../../extension/lib/ocr/pipeline/reading-order.js";

describe("reading-order", () => {
  it("orders lines top-to-bottom", () => {
    const lines = [
      { id: "a", polygon: [[0, 100], [100, 100], [100, 110], [0, 110]] },
      { id: "b", polygon: [[0, 0], [100, 0], [100, 10], [0, 10]] },
    ];
    const result = assignReadingOrder(lines);
    expect(result[0].id).toBe("b");
    expect(result[1].id).toBe("a");
    expect(result[0].readingOrder).toBe(0);
    expect(result[1].readingOrder).toBe(1);
  });

  it("orders lines left-to-right within same row", () => {
    const lines = [
      { id: "right", polygon: [[200, 0], [300, 0], [300, 10], [200, 10]] },
      { id: "left", polygon: [[0, 0], [100, 0], [100, 10], [0, 10]] },
    ];
    const result = assignReadingOrder(lines);
    expect(result[0].id).toBe("left");
    expect(result[1].id).toBe("right");
  });

  it("handles empty input", () => {
    expect(assignReadingOrder([])).toEqual([]);
  });
});
