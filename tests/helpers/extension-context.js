// E2E helper: launch a persistent Chromium context with the unpacked extension.
// Mirrors Tab Recorder's e2e pattern.

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = join(__dirname, '..', 'extension');

/**
 * Launch a persistent Chromium context with the extension loaded.
 * @param {import('@playwright/test').BrowserType} chromium
 * @param {string} [userDataDir]
 * @returns {Promise<import('@playwright/test').BrowserContext>}
 */
export async function launchExtensionContext(chromium, userDataDir) {
  // TODO: implement in Phase 1
  throw new Error('Extension context launcher not yet implemented');
}

/**
 * Find the extension's workspace tab.
 * @param {import('@playwright/test').BrowserContext} context
 * @returns {Promise<import('@playwright/test').Page>}
 */
export async function findWorkspaceTab(context) {
  // TODO: implement in Phase 1
  throw new Error('Workspace tab finder not yet implemented');
}
