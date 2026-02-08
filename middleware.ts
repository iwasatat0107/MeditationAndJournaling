import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';
import { rateLimit, getClientIp } from './lib/rate-limit';

const PUBLIC_ROUTES = ['/login', '/signup'];

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json).*)',
  ],
};

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Rate Limiting: 認証エンドポイント
  if (nextUrl.pathname.startsWith('/api/auth')) {
    const ip = getClientIp(request);

    // /api/auth/signup: 10リクエスト/分
    if (nextUrl.pathname === '/api/auth/signup') {
      const result = await rateLimit(`signup:${ip}`, {
        limit: 10,
        window: '1 m',
      });

      if (!result.success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
          },
        });
      }
    }

    // その他の /api/auth/*: 20リクエスト/分
    const result = await rateLimit(`auth:${ip}`, {
      limit: 20,
      window: '1 m',
    });

    if (!result.success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
        },
      });
    }

    return NextResponse.next();
  }

  const session = await auth();

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
