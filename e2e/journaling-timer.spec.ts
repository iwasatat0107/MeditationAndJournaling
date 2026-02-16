import { test, expect } from '@playwright/test';

test.describe('メモ書きタイマー', () => {
  test.beforeEach(async ({ page }) => {
    // テストユーザーでログイン
    await page.goto('/signup');
    const timestamp = Date.now();
    await page.fill('input#email', `test-journaling-${timestamp}@example.com`);
    await page.fill('input#password', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Journaling タブをクリック
    await page.click('text=Journaling');
  });

  test('タイマーの開始と停止', async ({ page }) => {
    // 初期表示確認
    await expect(page.locator('button:has-text("Start")')).toBeVisible();

    // タイマー開始
    await page.click('button:has-text("Start")');

    // Stop ボタンが表示される
    await expect(page.locator('button:has-text("Stop")')).toBeVisible({
      timeout: 2000,
    });

    // 少し待つ（タイマーが進むことを確認）
    await page.waitForTimeout(2000);

    // タイマー停止
    await page.click('button:has-text("Stop")');

    // Pause ボタンが表示される
    await expect(page.locator('button:has-text("Pause")')).toBeVisible({
      timeout: 2000,
    });
  });

  test('ページ遷移（休憩 → メモ書き）', async ({ page }) => {
    // 設定を変更（5秒 + 3秒休憩）
    await page.click('button[aria-label="Settings"]');

    // メモ書き時間を5秒に
    const inputs = await page.locator('input[type="number"]').all();
    await inputs[1].fill('5'); // 2番目のinput（Journaling duration）

    // 休憩時間を3秒に
    await inputs[2].fill('3'); // 3番目のinput（Break duration）

    await page.click('button:has-text("Save")');

    // タイマー開始
    await page.click('button:has-text("Start")');

    // 休憩フェーズの表示を確認（5秒後）
    await expect(page.locator('text=Break')).toBeVisible({
      timeout: 7000,
    });

    // メモ書きフェーズに戻ることを確認（さらに3秒後）
    await expect(page.locator('text=Writing')).toBeVisible({
      timeout: 5000,
    });
  });

  test('タイマーの完了', async ({ page }) => {
    // 設定を変更（5秒 × 1ページ）
    await page.click('button[aria-label="Settings"]');

    const inputs = await page.locator('input[type="number"]').all();
    await inputs[1].fill('5'); // Journaling duration
    await inputs[2].fill('1'); // Break duration（短く）

    await page.click('button:has-text("Save")');

    // タイマー開始
    await page.click('button:has-text("Start")');

    // タイマーが完了するまで待つ（最大15秒）
    await expect(page.locator('button:has-text("Start")')).toBeVisible({
      timeout: 20000,
    });

    // History タブに移動
    await page.click('text=History');

    // セッションが保存されていることを確認
    await expect(page.locator('text=Journaling')).toBeVisible({
      timeout: 5000,
    });
  });

  test('タイマーの途中終了', async ({ page }) => {
    // タイマー開始
    await page.click('button:has-text("Start")');
    await page.waitForTimeout(2000);

    // End ボタンをクリック
    await page.click('button[data-testid="stop-button"]');

    // 初期状態に戻る
    await expect(page.locator('button:has-text("Start")')).toBeVisible({
      timeout: 2000,
    });
  });
});
