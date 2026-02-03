import { signupSchema } from '../validation';

describe('signupSchema', () => {
  describe('正常系', () => {
    it('有効なメールとパスワードで検証に通る', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('パスワードが正確に8文字で検証に通る', () => {
      const result = signupSchema.safeParse({
        email: 'user@test.com',
        password: '12345678',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('異常系: email', () => {
    it('無効なメールフォーマットで検証に失敗する', () => {
      const result = signupSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('email');
    });

    it('メールが空文字で検証に失敗する', () => {
      const result = signupSchema.safeParse({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });

    it('@記号なしのメールで検証に失敗する', () => {
      const result = signupSchema.safeParse({
        email: 'testexample.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('異常系: password', () => {
    it('パスワードが7文字で検証に失敗する', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: '1234567',
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('password');
    });

    it('パスワードが空文字で検証に失敗する', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
    });
  });
});
