import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// バックエンドJWTペイロードインターフェース
interface BackendJWTPayload {
  sub: string          // ユーザーID
  email: string        // メールアドレス
  name: string         // ユーザー名
  exp: number          // 有効期限
  iat: number          // 発行時刻
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
      }
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // AuthorizationヘッダーまたはCookieからトークンを取得
  const authHeader = req.headers['authorization']
  const headerToken = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
  const cookieToken = req.cookies?.wadake_token
  
  const token = headerToken || cookieToken

  if (!token) {
    res.status(401).json({ error: 'アクセストークンが必要です' })
    return
  }

  try {
    // JWTシークレットを環境変数から取得
    const jwtSecret = process.env.JWT_SECRET
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set')
      res.status(500).json({ error: 'サーバー設定エラー' })
      return
    }

    // JWTを検証
    const decoded = jwt.verify(token, jwtSecret) as BackendJWTPayload
    
    // トークンの有効期限をチェック
    if (decoded.exp < Date.now() / 1000) {
      res.status(401).json({ error: 'トークンの有効期限が切れています' })
      return
    }

    // リクエストオブジェクトにユーザー情報を追加
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name
    }

    next()
  } catch (error) {
    console.error('JWT verification error:', error)
    res.status(403).json({ error: '無効なトークンです' })
  }
}

// オプションの認証（認証されていなくても進めるが、認証されていればユーザー情報を追加）
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    next() // 認証なしで続行
    return
  }

  try {
    const jwtSecret = process.env.JWT_SECRET
    
    if (!jwtSecret) {
      next() // シークレットが設定されていない場合は認証なしで続行
      return
    }

    const decoded = jwt.verify(token, jwtSecret) as BackendJWTPayload
    
    if (decoded.exp < Date.now() / 1000) {
      next() // 期限切れの場合は認証なしで続行
      return
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name
    }

    next()
  } catch (error) {
    console.error('JWT verification error:', error)
    next() // エラーの場合も認証なしで続行
  }
} 