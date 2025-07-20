import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// カテゴリ一覧取得
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query

    const where = type ? { type: type as string } : {}

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    })

    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// 収入カテゴリ一覧取得
router.get('/income', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { type: 'income' },
      orderBy: {
        name: 'asc'
      }
    })

    res.json(categories)
  } catch (error) {
    console.error('Error fetching income categories:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

export default router 