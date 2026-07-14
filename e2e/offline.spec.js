// E2E: Block all network traffic and repeat image/PDF OCR.
import { test, expect } from '@playwright/test';

test('OCR works with network disabled', async () => {
  test.skip(true, 'Offline E2E pending — Phase 7');
});
