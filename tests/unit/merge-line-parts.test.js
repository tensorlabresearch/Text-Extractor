import { describe, it, expect } from "vitest";
import { mergeLineParts } from "../../extension/lib/ocr/pipeline/merge-line-parts.js";

describe("merge-line-parts", () => {
  it("returns empty string for no parts", () => {
    expect(mergeLineParts([])).toBe("");
  });

  it("returns single part unchanged", () => {
    expect(mergeLineParts(["hello"])).toBe("hello");
  });

  it("concatenates parts without overlap", () => {
    expect(mergeLineParts(["hello", "world"])).toBe("helloworld");
  });

  it("deduplicates overlapping boundary characters", () => {
    expect(mergeLineParts(["hello", "lorld"], 2)).toBe("hellold");
  });

  it("does not deduplicate when no overlap", () => {
    expect(mergeLineParts(["hello", "world"], 2)).toBe("helloworld");
  });
});
