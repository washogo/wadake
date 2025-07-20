import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/${path}${url.search}`

    // JWTトークンをCookieから取得
    const jwtToken = request.cookies.get('wadake_jwt_token')?.value

    // リクエストヘッダーを準備
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // JWTトークンがある場合はAuthorizationヘッダーに追加
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    }

    // リクエストボディを取得（POST, PUT, DELETEの場合）
    let body: string | undefined
    if (method !== 'GET') {
      body = await request.text()
    }

    // バックエンドにリクエストを転送
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    })

    // レスポンスを取得
    const responseData = await response.json()

    // レスポンスヘッダーを設定
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // バックエンドからCookieを転送
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      responseHeaders['set-cookie'] = setCookieHeader
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 