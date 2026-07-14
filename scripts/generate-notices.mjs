#!/usr/bin/env node
// Generates THIRD_PARTY_NOTICES.md from vendored license files.

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const VENDOR_DIR = join(REPO_ROOT, "extension", "lib", "vendor");

async function main() {
  const notices = ["# Third Party Notices", ""];
  notices.push("This extension includes vendored copies of the following libraries:");
  notices.push("");

  const vendors = ["transformers", "onnxruntime", "pdfjs"];
  for (const vendor of vendors) {
    const vendorPath = join(VENDOR_DIR, vendor);
    if (!existsSync(vendorPath)) continue;

    const licensePath = join(vendorPath, "LICENSE");
    if (existsSync(licensePath)) {
      const license = await readFile(licensePath, "utf8");
      const name = vendor === "pdfjs" ? "PDF.js" : vendor === "onnxruntime" ? "ONNX Runtime Web" : "Transformers.js";
      notices.push(`## ${name}`, "");
      notices.push("```");
      notices.push(license.trim());
      notices.push("```", "");
    }
  }

  notices.push("## Model Licenses", "");
  notices.push("- **PP-OCRv5 mobile detector**: Apache-2.0, PaddlePaddle");
  notices.push("- **TrOCR small printed**: See Xenova/trocr-small-printed repository");
  notices.push("");

  const outPath = join(REPO_ROOT, "THIRD_PARTY_NOTICES.md");
  await writeFile(outPath, notices.join("\n"), "utf8");
  console.log(`Generated ${outPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
