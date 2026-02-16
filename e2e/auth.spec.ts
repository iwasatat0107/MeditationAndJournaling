import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('新規登録フロー', async ({ page }) => {
    // 新規登録ページへ遷移
    await page.goto('/signup');
    await expect(page).toHaveURL('/signup');

    // フォーム入力
    const timestamp = Date.now();
    await page.fill('input#email', `test-${timestamp}@example.com`);
    await page.fill('input#password', 'TestPassword123!');

    // サインアップボタンをクリック
    await page.click('button[type="submit"]');

    // ログイン成功後、ホームページにリダイレクト
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Meditation タブが表示されることを確認
    await expect(page.getByRole('button', { name: 'Meditation' })).toBeVisible();
  });

  test('ログインフロー', async ({ page }) => {
    // テストユーザーで新規登録
    await page.goto('/signup');
    const timestamp = Date.now();
    const email = `test-login-${timestamp}@example.com`;
    const password = 'TestPassword123!';

    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // ログアウト
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');

    // ログイン
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.click('button[type="submit"]');

    // ログイン成功後、ホームページにリダイレクト
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Meditation' })).toBeVisible();
  });

  test('ログインエラー（存在しないユーザー）', async ({ page }) => {
    // ログインページへ遷移
    await page.goto('/login');

    // 存在しないユーザーでログイン
    await page.fill('input#email', 'nonexistent@example.com');
    await page.fill('input#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示される（英語または日本語）
    await expect(
      page.locator('.text-red-600, .text-red-400')
    ).toBeVisible({
      timeout: 5000,
    });

    // エラーメッセージのテキストを確認
    const errorText = await page.locator('.text-red-600, .text-red-400').textContent();
    expect(errorText).toMatch(/Invalid email or password|メールアドレスまたはパスワードが正しくありません/);
  });
});
