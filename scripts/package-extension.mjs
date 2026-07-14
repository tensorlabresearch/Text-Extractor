#!/usr/bin/env node
// Packages the extension into a ZIP ready for Chrome Web Store upload.

import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, rm, mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const EXTENSION_DIR = join(REPO_ROOT, "extension");
const BUILD_DIR = join(REPO_ROOT, "build");

async function main() {
  const manifest = JSON.parse(await readFile(join(EXTENSION_DIR, "manifest.json"), "utf8"));
  const version = manifest.version;
  const name = manifest.name.replace(/\s+/g, "-").toLowerCase();

  console.log(`Packaging ${name} v${version}...`);

  // Clean build dir
  await rm(BUILD_DIR, { recursive: true, force: true });
  await mkdir(BUILD_DIR, { recursive: true });

  const zipName = `${name}-v${version}.zip`;
  const zipPath = join(BUILD_DIR, zipName);

  // Create ZIP
  execSync(
    `cd "${EXTENSION_DIR}" && zip -r "${zipPath}" . -x 'node_modules/*' -x '.DS_Store' -x '*.md'`,
    { stdio: "inherit" }
  );

  console.log(`\nCreated: ${zipPath}`);

  // Show size
  const sizeOut = execSync(`du -h "${zipPath}"`).toString().trim();
  console.log(`Size: ${sizeOut.split("\t")[0]}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
