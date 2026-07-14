import { test } from '@playwright/test';

test('OCR works with network disabled', async () => {
  test.skip(true, 'Offline E2E pending — Phase 7');
});
