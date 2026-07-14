#!/usr/bin/env node
// Verifies that all model files in extension/models/ match their pinned
// SHA-256 hashes from models.lock.json.

import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const LOCK_PATH = join(REPO_ROOT, "models.lock.json");
const MODELS_DIR = join(REPO_ROOT, "extension", "models");

async function main() {
  const lockRaw = await readFile(LOCK_PATH, "utf8");
  const lock = JSON.parse(lockRaw);

  let errors = 0;

  for (const [modelId, spec] of Object.entries(lock)) {
    for (const [filePath, fileSpec] of Object.entries(spec.files)) {
      const destPath = join(MODELS_DIR, modelId, filePath);
      if (!existsSync(destPath)) {
        console.error(`  ✗ MISSING: ${modelId}/${filePath}`);
        errors++;
        continue;
      }
      const hash = await sha256(destPath);
      if (hash !== fileSpec.sha256) {
        console.error(`  ✗ HASH MISMATCH: ${modelId}/${filePath}`);
        console.error(`    expected: ${fileSpec.sha256}`);
        console.error(`    got:      ${hash}`);
        errors++;
      } else {
        console.log(`  ✓ ${modelId}/${filePath}`);
      }
    }
  }

  if (errors > 0) {
    console.error(`\n${errors} verification error(s).`);
    process.exit(1);
  }
  console.log("\nAll model files verified.");
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
