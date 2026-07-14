import { describe, it, expect } from "vitest";
import { normalizeText } from "../../extension/lib/ocr/pipeline/text-normalization.js";

describe("text-normalization", () => {
  it("trims whitespace", () => {
    expect(normalizeText("  hello  ")).toBe("hello");
  });

  it("replaces nonstandard spaces", () => {
    expect(normalizeText("hello\u00A0world")).toBe("hello world");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeText("hello    world")).toBe("hello world");
  });

  it("removes control characters", () => {
    expect(normalizeText("hello\x00\x01world")).toBe("helloworld");
  });

  it("removes generated special tokens", () => {
    expect(normalizeText("<|endoftext|>hello")).toBe("hello");
  });

  it("preserves punctuation and capitalization", () => {
    expect(normalizeText("Hello, World! 123")).toBe("Hello, World! 123");
  });
});
