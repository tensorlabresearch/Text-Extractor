import { describe, it, expect } from "vitest";
import { exportTxt, exportMarkdown, exportJson, getExporter } from "../../extension/lib/app/exports.js";

describe("exports", () => {
  const pages = [
    {
      pageNumber: 1,
      source: "ocr",
      width: 612,
      height: 792,
      lines: [{ id: "l1", text: "Hello World", readingOrder: 0 }],
      plainText: "Hello World",
      diagnostics: {},
    },
    {
      pageNumber: 2,
      source: "native",
      width: 612,
      height: 792,
      lines: [{ id: "l2", text: "Second page", readingOrder: 0 }],
      plainText: "Second page",
      diagnostics: {},
    },
  ];

  it("exports TXT with page headers", () => {
    const txt = exportTxt(pages);
    expect(txt).toContain("--- Page 1 ---");
    expect(txt).toContain("--- Page 2 ---");
    expect(txt).toContain("Hello World");
    expect(txt).toContain("Second page");
  });

  it("exports Markdown with page headers", () => {
    const md = exportMarkdown(pages);
    expect(md).toContain("## Page 1");
    expect(md).toContain("## Page 2");
    expect(md).toContain("---");
  });

  it("exports JSON with structure", () => {
    const json = exportJson(pages);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].pageNumber).toBe(1);
    expect(parsed[0].lines[0].text).toBe("Hello World");
  });

  it("getExporter returns correct function", () => {
    expect(getExporter("txt")).toBe(exportTxt);
    expect(getExporter("markdown")).toBe(exportMarkdown);
    expect(getExporter("json")).toBe(exportJson);
    expect(() => getExporter("unknown")).toThrow();
  });
});
