import { test, expect } from '@playwright/test';

test.describe('瞑想タイマー', () => {
  test.beforeEach(async ({ page }) => {
    // テストユーザーでログイン
    await page.goto('/signup');
    const timestamp = Date.now();
    await page.fill('input#email', `test-meditation-${timestamp}@example.com`);
    await page.fill('input#password', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Meditation タブをクリック
    await page.click('text=Meditation');
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

  test('タイマーの完了', async ({ page }) => {
    // 設定を変更（5秒に短縮）
    await page.click('button[aria-label="Settings"]');
    await page.fill('input[type="number"]', '5'); // 5秒に変更
    await page.click('button:has-text("Save")');

    // タイマー開始
    await page.click('button:has-text("Start")');

    // タイマーが完了するまで待つ（最大10秒）
    await expect(page.locator('button:has-text("Start")')).toBeVisible({
      timeout: 12000,
    });

    // History タブに移動
    await page.click('text=History');

    // セッションが保存されていることを確認
    await expect(page.locator('text=Meditation')).toBeVisible({
      timeout: 5000,
    });
  });

  test('タイマーの途中終了', async ({ page }) => {
    // タイマー開始
    await page.click('button:has-text("Start")');
    await page.waitForTimeout(2000);

    // End ボタンをクリック
    await page.click('button:has-text("End")');

    // 確認ダイアログが表示される（注: ブラウザのダイアログはPlaywrightで自動的にOKされる）

    // 初期状態に戻る
    await expect(page.locator('button:has-text("Start")')).toBeVisible({
      timeout: 2000,
    });
  });
});
