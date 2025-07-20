import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// 収入一覧取得
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    
    const incomes = await prisma.income.findMany({
      where: { userId },
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    res.json(incomes)
  } catch (error) {
    console.error('Error fetching incomes:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// 収入登録
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { categoryId, amount, memo, date } = req.body

    // バリデーション
    if (!categoryId || !amount || !date) {
      res.status(400).json({ error: '必須項目が不足しています' })
      return
    }

    if (amount <= 0) {
      res.status(400).json({ error: '金額は0より大きい値を入力してください' })
      return
    }

    // カテゴリの存在確認
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        type: 'income'
      }
    })

    if (!category) {
      res.status(400).json({ error: '無効なカテゴリです' })
      return
    }

    const income = await prisma.income.create({
      data: {
        userId,
        categoryId,
        amount,
        memo,
        date: new Date(date)
      },
      include: {
        category: true
      }
    })

    res.status(201).json(income)
  } catch (error) {
    console.error('Error creating income:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// 収入更新
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const incomeId = req.params.id
    const { categoryId, amount, memo, date } = req.body

    // バリデーション
    if (!categoryId || !amount || !date) {
      res.status(400).json({ error: '必須項目が不足しています' })
      return
    }

    if (amount <= 0) {
      res.status(400).json({ error: '金額は0より大きい値を入力してください' })
      return
    }

    // 収入の存在確認と所有者確認
    const existingIncome = await prisma.income.findFirst({
      where: { 
        id: incomeId,
        userId 
      }
    })

    if (!existingIncome) {
      res.status(404).json({ error: '収入が見つかりません' })
      return
    }

    // カテゴリの存在確認
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        type: 'income'
      }
    })

    if (!category) {
      res.status(400).json({ error: '無効なカテゴリです' })
      return
    }

    const income = await prisma.income.update({
      where: { id: incomeId },
      data: {
        categoryId,
        amount,
        memo,
        date: new Date(date)
      },
      include: {
        category: true
      }
    })

    res.json(income)
  } catch (error) {
    console.error('Error updating income:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// 収入削除
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const incomeId = req.params.id

    // 収入の存在確認と所有者確認
    const existingIncome = await prisma.income.findFirst({
      where: { 
        id: incomeId,
        userId 
      }
    })

    if (!existingIncome) {
      res.status(404).json({ error: '収入が見つかりません' })
      return
    }

    await prisma.income.delete({
      where: { id: incomeId }
    })

    res.json({ message: '収入を削除しました' })
  } catch (error) {
    console.error('Error deleting income:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

export default router 