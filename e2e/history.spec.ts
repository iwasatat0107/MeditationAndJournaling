import { test, expect } from '@playwright/test';

test.describe('履歴表示', () => {
  test.beforeEach(async ({ page }) => {
    // テストユーザーでログイン
    await page.goto('/signup');
    const timestamp = Date.now();
    await page.fill('input#email', `test-history-${timestamp}@example.com`);
    await page.fill('input#password', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('初期状態で「No records yet」が表示される', async ({ page }) => {
    // History タブをクリック
    await page.click('text=History');

    // No records yet が表示される
    await expect(page.locator('text=No records yet')).toBeVisible({
      timeout: 5000,
    });
  });

  test('瞑想セッション完了後に履歴が表示される', async ({ page }) => {
    // 瞑想タイマーを短く設定（5秒）
    await page.click('button[aria-label="Settings"]');
    await page.fill('input[type="number"]', '5');
    await page.click('button:has-text("Save")');

    // Meditation タブで瞑想を完了
    await page.click('text=Meditation');
    await page.click('button:has-text("Start")');

    // タイマー完了まで待つ
    await expect(page.locator('button:has-text("Start")')).toBeVisible({
      timeout: 12000,
    });

    // History タブに移動
    await page.click('text=History');

    // セッションが表示される
    await expect(page.locator('text=Meditation')).toBeVisible({
      timeout: 5000,
    });

    // 統計カードに瞑想回数が表示される
    const meditationCard = page.locator('div').filter({ hasText: /^Meditation\d+$/ });
    await expect(meditationCard).toBeVisible();
  });

  test('セッションの削除', async ({ page }) => {
    // 瞑想セッションを追加
    await page.click('button[aria-label="Settings"]');
    await page.fill('input[type="number"]', '5');
    await page.click('button:has-text("Save")');

    await page.click('text=Meditation');
    await page.click('button:has-text("Start")');
    await expect(page.locator('button:has-text("Start")')).toBeVisible({
      timeout: 12000,
    });

    // History タブに移動
    await page.click('text=History');

    // セッションが表示されることを確認
    await expect(page.locator('text=Meditation')).toBeVisible({
      timeout: 5000,
    });

    // Delete ボタンをクリック（確認ダイアログは自動的にOKされる）
    await page.click('button:has-text("Delete")');

    // セッションが削除される
    await expect(page.locator('text=No records yet')).toBeVisible({
      timeout: 5000,
    });
  });

  test('複数セッションの表示', async ({ page }) => {
    // 設定を短く
    await page.click('button[aria-label="Settings"]');
    await page.fill('input[type="number"]', '5');
    await page.click('button:has-text("Save")');

    // 瞑想セッション1
    await page.click('text=Meditation');
    await page.click('button:has-text("Start")');
    await expect(page.locator('button:has-text("Start")')).toBeVisible({
      timeout: 12000,
    });

    // 瞑想セッション2
    await page.click('button:has-text("Start")');
    await expect(page.locator('button:has-text("Start")')).toBeVisible({
      timeout: 12000,
    });

    // History タブに移動
    await page.click('text=History');

    // 2つのセッションが表示される
    const meditationItems = page.locator('text=Meditation');
    await expect(meditationItems).toHaveCount(3, { timeout: 5000 }); // タブ + セッション2件

    // 統計カードに「2」が表示される
    const meditationCard = page.locator('div').filter({ hasText: /^Meditation2$/ });
    await expect(meditationCard).toBeVisible();
  });
});
