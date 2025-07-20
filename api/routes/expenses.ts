import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// 支出一覧取得
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    res.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// 支出登録
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { categoryId, amount, description, date } = req.body

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
        type: 'expense'
      }
    })

    if (!category) {
      res.status(400).json({ error: '無効なカテゴリです' })
      return
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        categoryId,
        amount,
        description,
        date: new Date(date)
      },
      include: {
        category: true
      }
    })

    res.status(201).json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// 支出更新
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const expenseId = req.params.id
    const { categoryId, amount, description, date } = req.body

    // バリデーション
    if (!categoryId || !amount || !date) {
      res.status(400).json({ error: '必須項目が不足しています' })
      return
    }

    if (amount <= 0) {
      res.status(400).json({ error: '金額は0より大きい値を入力してください' })
      return
    }

    // 支出の存在確認と所有者確認
    const existingExpense = await prisma.expense.findFirst({
      where: { 
        id: expenseId,
        userId 
      }
    })

    if (!existingExpense) {
      res.status(404).json({ error: '支出が見つかりません' })
      return
    }

    // カテゴリの存在確認
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        type: 'expense'
      }
    })

    if (!category) {
      res.status(400).json({ error: '無効なカテゴリです' })
      return
    }

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        categoryId,
        amount,
        description,
        date: new Date(date)
      },
      include: {
        category: true
      }
    })

    res.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

// 支出削除
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const expenseId = req.params.id

    // 支出の存在確認と所有者確認
    const existingExpense = await prisma.expense.findFirst({
      where: { 
        id: expenseId,
        userId 
      }
    })

    if (!existingExpense) {
      res.status(404).json({ error: '支出が見つかりません' })
      return
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    })

    res.json({ message: '支出を削除しました' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

export default router 