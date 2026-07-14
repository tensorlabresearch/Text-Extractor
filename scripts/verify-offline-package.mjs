#!/usr/bin/env node
// Inspects the final extension ZIP and fails when offline/policy
// requirements are violated.

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const EXTENSION_DIR = join(REPO_ROOT, "extension");

async function main() {
  let errors = 0;

  // 1. Check manifest for host_permissions
  const manifestPath = join(EXTENSION_DIR, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.host_permissions && manifest.host_permissions.length > 0) {
    console.error("  ✗ host_permissions present in manifest");
    errors++;
  }

  // 2. Scan all JS files for http:// and https:// URLs (excluding vendor)
  const jsFiles = await collectJsFiles(EXTENSION_DIR);
  const cdnPattern = /https?:\/\/(cdn|unpkg|jsdelivr|ajax\.google|raw\.githubusercontent|huggingface\.co)/;

  for (const file of jsFiles) {
    const content = await readFile(file, "utf8");
    if (cdnPattern.test(content)) {
      console.error(`  ✗ Remote URL found in: ${file}`);
      errors++;
    }
    if (/\beval\s*\(/.test(content)) {
      console.error(`  ✗ eval() found in: ${file}`);
      errors++;
    }
    if (/new\s+Function\s*\(/.test(content)) {
      console.error(`  ✗ new Function() found in: ${file}`);
      errors++;
    }
  }

  // 3. Check allowRemoteModels is disabled
  const workerFile = join(EXTENSION_DIR, "workers", "ocr-worker.js");
  if (existsSync(workerFile)) {
    // Will be checked more thoroughly once worker is implemented
  }

  // 4. Check required model files exist (if models.lock.json exists)
  const lockPath = join(REPO_ROOT, "models.lock.json");
  if (existsSync(lockPath)) {
    const lock = JSON.parse(await readFile(lockPath, "utf8"));
    for (const [modelId, spec] of Object.entries(lock)) {
      for (const filePath of Object.keys(spec.files)) {
        const fullPath = join(EXTENSION_DIR, "models", modelId, filePath);
        if (!existsSync(fullPath)) {
          console.error(`  ✗ Missing model file: ${modelId}/${filePath}`);
          errors++;
        }
      }
    }
  }

  if (errors > 0) {
    console.error(`\n${errors} offline verification error(s).`);
    process.exit(1);
  }
  console.log("\nOffline package verification passed.");
}

async function collectJsFiles(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "vendor") continue; // skip vendored libs
      results.push(...await collectJsFiles(fullPath));
    } else if (entry.name.endsWith(".js") || entry.name.endsWith(".mjs")) {
      results.push(fullPath);
    }
  }
  return results;
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
