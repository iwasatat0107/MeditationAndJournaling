import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('無効なメールフォーマットです'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
});

export type SignupInput = z.infer<typeof signupSchema>;
