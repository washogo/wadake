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

export default router