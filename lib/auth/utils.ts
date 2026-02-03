import bcrypt from 'bcryptjs';

/**
 * パスワードをハッシュ化する
 * @param password - プレーンテキストのパスワード
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * パスワードを検証する
 * @param password - プレーンテキストのパスワード
 * @param hash - ハッシュ化されたパスワード
 * @returns パスワードが一致する場合はtrue、それ以外はfalse
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!password || password.length === 0) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // 無効なハッシュフォーマットなどのエラー
    console.error('Password verification error:', error);
    return false;
  }
}
