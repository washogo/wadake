import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
// import { authenticateToken } from '../middleware/auth' // 認証ミドルウェアがあれば有効化

const router = Router()

// グループ作成
router.post('/', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { name, userId } = req.body
    if (!name || !userId) {
      res.status(400).json({ error: 'グループ名と作成者IDが必要です' })
      return
    }
    const group = await prisma.group.create({
      data: {
        name,
        users: {
          create: { userId, role: 'admin' }
        }
      }
    })
    res.json(group)
  } catch (error) {
    res.status(500).json({ error: 'グループ作成エラー' })
  }
})

// 所属グループ一覧取得
router.get('/user/:userId', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const groups = await prisma.group.findMany({
      where: {
        users: { some: { userId } }
      },
      include: { users: true }
    })
    res.json(groups)
  } catch (error) {
    res.status(500).json({ error: 'グループ一覧取得エラー' })
  }
})

// メンバー招待（追加）
router.post('/:groupId/invite', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const { userId, role } = req.body
    if (!userId) {
      res.status(400).json({ error: '招待するユーザーIDが必要です' })
      return
    }
    const userGroup = await prisma.userGroup.create({
      data: { userId, groupId, role: role || 'member' }
    })
    res.json(userGroup)
  } catch (error) {
    res.status(500).json({ error: 'メンバー招待エラー' })
  }
})

// グループメンバー一覧
router.get('/:groupId/members', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const members = await prisma.userGroup.findMany({
      where: { groupId },
      include: { user: true }
    })
    res.json(members)
  } catch (error) {
    res.status(500).json({ error: 'メンバー一覧取得エラー' })
  }
})

// グループ単位の収入管理API
// グループの収入一覧取得
router.get('/:groupId/incomes', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const incomes = await prisma.income.findMany({
      where: { groupId },
      include: { category: true, user: true },
      orderBy: { date: 'desc' }
    })
    res.json(incomes)
  } catch (error) {
    res.status(500).json({ error: 'グループ収入一覧取得エラー' })
  }
})

// グループの収入作成
router.post('/:groupId/incomes', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const { userId, categoryId, amount, memo, date } = req.body
    if (!userId || !categoryId || !amount || !date) {
      res.status(400).json({ error: '必要な項目が不足しています' })
      return
    }
    const income = await prisma.income.create({
      data: {
        userId,
        groupId,
        categoryId,
        amount: parseInt(amount),
        memo,
        date: new Date(date)
      },
      include: { category: true, user: true }
    })
    res.json(income)
  } catch (error) {
    res.status(500).json({ error: 'グループ収入作成エラー' })
  }
})

// グループの収入更新
router.put('/:groupId/incomes/:incomeId', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId, incomeId } = req.params
    const { categoryId, amount, memo, date } = req.body
    const income = await prisma.income.update({
      where: { id: incomeId, groupId },
      data: {
        categoryId,
        amount: parseInt(amount),
        memo,
        date: new Date(date)
      },
      include: { category: true, user: true }
    })
    res.json(income)
  } catch (error) {
    res.status(500).json({ error: 'グループ収入更新エラー' })
  }
})

// グループの収入削除
router.delete('/:groupId/incomes/:incomeId', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId, incomeId } = req.params
    await prisma.income.delete({
      where: { id: incomeId, groupId }
    })
    res.json({ message: '収入を削除しました' })
  } catch (error) {
    res.status(500).json({ error: 'グループ収入削除エラー' })
  }
})

// グループ単位の支出管理API
// グループの支出一覧取得
router.get('/:groupId/expenses', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { category: true, user: true },
      orderBy: { date: 'desc' }
    })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ error: 'グループ支出一覧取得エラー' })
  }
})

// グループの支出作成
router.post('/:groupId/expenses', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const { userId, categoryId, amount, description, date } = req.body
    if (!userId || !categoryId || !amount || !date) {
      res.status(400).json({ error: '必要な項目が不足しています' })
      return
    }
    const expense = await prisma.expense.create({
      data: {
        userId,
        groupId,
        categoryId,
        amount: parseInt(amount),
        description,
        date: new Date(date)
      },
      include: { category: true, user: true }
    })
    res.json(expense)
  } catch (error) {
    res.status(500).json({ error: 'グループ支出作成エラー' })
  }
})

// グループの支出更新
router.put('/:groupId/expenses/:expenseId', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId, expenseId } = req.params
    const { categoryId, amount, description, date } = req.body
    const expense = await prisma.expense.update({
      where: { id: expenseId, groupId },
      data: {
        categoryId,
        amount: parseInt(amount),
        description,
        date: new Date(date)
      },
      include: { category: true, user: true }
    })
    res.json(expense)
  } catch (error) {
    res.status(500).json({ error: 'グループ支出更新エラー' })
  }
})

// グループの支出削除
router.delete('/:groupId/expenses/:expenseId', /*authenticateToken,*/ async (req: Request, res: Response) => {
  try {
    const { groupId, expenseId } = req.params
    await prisma.expense.delete({
      where: { id: expenseId, groupId }
    })
    res.json({ message: '支出を削除しました' })
  } catch (error) {
    res.status(500).json({ error: 'グループ支出削除エラー' })
  }
})

export default router