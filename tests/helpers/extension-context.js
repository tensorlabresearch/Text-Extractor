// E2E helper: launch a persistent Chromium context with the unpacked extension.
// Mirrors Tab Recorder's e2e pattern.

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const _EXTENSION_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'extension');

/**
 * Launch a persistent Chromium context with the extension loaded.
 * @param {_chromium} _chromium
 * @param {_userDataDir} _userDataDir
 * @returns {Promise<import('@playwright/test').BrowserContext>}
 */
export async function launchExtensionContext(_chromium, _userDataDir) {
  throw new Error('Extension context launcher not yet implemented');
}

/**
 * Find the extension's workspace tab.
 * @param {_context} _context
 * @returns {Promise<import('@playwright/test').Page>}
 */
export async function findWorkspaceTab(_context) {
  throw new Error('Workspace tab finder not yet implemented');
}
