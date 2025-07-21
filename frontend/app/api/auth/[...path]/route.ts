import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    // パスパラメータを取得
    const path = request.nextUrl.pathname.replace(/^\/api\/auth\//, "");
    const backendUrl = `${BACKEND_URL}/api/auth/${path}`;

    // リクエストボディを取得
    const body = await request.text();

    // バックエンドにリクエストを転送
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    // レスポンスを取得
    const responseData = await response.json();

    // レスポンスヘッダーを設定
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // バックエンドからCookieを転送（JWTトークン）
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders['set-cookie'] = setCookieHeader;
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 