import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  method: string
) {
  try {
    // パスパラメータを取得
    const path = request.nextUrl.pathname.replace(/^\/api\//, "");
    const url = new URL(request.url);
    const backendUrl = `${BACKEND_URL}/api/${path}${url.search}`;

    // JWTトークンをCookieから取得
    const jwtToken = request.cookies.get('wadake_jwt_token')?.value;

    // リクエストヘッダーを準備
    const reqHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // JWTトークンがある場合はAuthorizationヘッダーに追加
    if (jwtToken) {
      reqHeaders['Authorization'] = `Bearer ${jwtToken}`;
    }

    // リクエストボディを取得（GET以外の場合）
    let body: string | undefined;
    if (method !== 'GET') {
      body = await request.text();
    }

    // バックエンドにリクエストを転送
    const response = await fetch(backendUrl, {
      method,
      headers: reqHeaders,
      body,
    });

    // レスポンスを取得
    const responseData = await response.json();

    // レスポンスヘッダーを設定
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // バックエンドからCookieを転送
    const setCookieHeaders = response.headers.getSetCookie ? response.headers.getSetCookie() : response.headers.get('set-cookie');
    if (setCookieHeaders) {
      if (Array.isArray(setCookieHeaders)) {
        setCookieHeaders.forEach((cookie: string) => headers.append('set-cookie', cookie));
      } else {
        headers.append('set-cookie', setCookieHeaders);
      }
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 