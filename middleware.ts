import { NextResponse } from 'next/server';
import { auth } from './auth';

const PUBLIC_ROUTES = ['/login', '/signup'];

export default async function middleware(request: { nextUrl: URL }) {
  const { nextUrl } = request;
  const session = await auth();

  // NextAuth APIルートは常に公開
  if (nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 公開ルートの処理
  if (PUBLIC_ROUTES.includes(nextUrl.pathname)) {
    // 認証済みなら "/" へリダイレクト
    if (session) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  // 保護ルート（それ以外の全ルート）の処理
  if (!session) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
}
