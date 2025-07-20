import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// ユーザー情報から独自JWTを発行
router.post('/token', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('POST /api/auth/token')
    const { user } = req.body

    if (!user || !user.id || !user.email) {
      console.log('POST /api/auth/token - Invalid user data:', { user })
      res.status(400).json({ error: 'ユーザー情報が必要です' })
      return
    }

    // ユーザー情報を取得または作成
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      // 新しいユーザーを作成
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      })
    }

    // 独自JWTトークンを発行
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      res.status(500).json({ error: 'サーバー設定エラー' })
      return
    }

    const token = jwt.sign(
      {
        sub: dbUser.id,
        email: user.email,
        name: dbUser.name,
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    console.log('POST /api/auth/token - Token generated successfully for user:', dbUser.id)
    
    // CookieにJWTトークンを設定
    res.cookie('wadake_jwt_token', token, {
      httpOnly: true, // フロントエンドからアクセス不可にする
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24時間
    })
    
    res.json({ 
      token,
      user: dbUser
    })
  } catch (error) {
    console.error('Error generating token:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// ログアウト
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('wadake_jwt_token')
  res.json({ message: 'ログアウトしました' })
})

// 認証状態確認
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      res.status(404).json({ error: 'ユーザーが見つかりません' })
      return
    }

    res.json({ 
      authenticated: true,
      user 
    })
  } catch (error) {
    console.error('Error checking auth status:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// 認証後のAPI疎通確認用エンドポイント
router.get('/ping', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  res.json({
    message: '認証済みAPI疎通OK',
    user: {
      id: req.user?.id,
      name: req.user?.name
    }
  })
})

export default router 