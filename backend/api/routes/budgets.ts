import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// すべてのルートで認証を必須とする
router.use(authenticateToken);

// 予算一覧取得（グループ対応）
router.post('/groups/:groupId/budgets/list', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'ユーザーIDが必要です' });
      return;
    }

    // ユーザーがグループに所属しているかチェック
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!userGroup) {
      res.status(403).json({ error: 'このグループにアクセスする権限がありません' });
      return;
    }

    const budgets = await prisma.budget.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(budgets);
  } catch (error) {
    console.error('予算一覧取得エラー:', error);
    res.status(500).json({ error: '予算一覧の取得に失敗しました' });
  }
});

// 予算作成（グループ対応）
router.post('/groups/:groupId/budgets', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId, amount, purpose, date } = req.body;

    if (!userId || !amount || !purpose || !date) {
      res.status(400).json({ error: '必要な項目が不足しています' });
      return;
    }

    // ユーザーがグループに所属しているかチェック
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!userGroup) {
      res.status(403).json({ error: 'このグループにアクセスする権限がありません' });
      return;
    }

    const budget = await prisma.budget.create({
      data: {
        groupId,
        amount: parseInt(amount),
        purpose,
        date: new Date(date),
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('予算作成エラー:', error);
    res.status(500).json({ error: '予算の作成に失敗しました' });
  }
});

// 予算更新（グループ対応）
router.put('/groups/:groupId/budgets/:id', async (req: Request, res: Response) => {
  try {
    const { groupId, id } = req.params;
    const { userId, amount, purpose, date } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'ユーザーIDが必要です' });
      return;
    }

    // ユーザーがグループに所属しているかチェック
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!userGroup) {
      res.status(403).json({ error: 'このグループにアクセスする権限がありません' });
      return;
    }

    // 予算が存在し、指定されたグループに属しているかチェック
    const existingBudget = await prisma.budget.findFirst({
      where: { id, groupId },
    });

    if (!existingBudget) {
      res.status(404).json({ error: '予算が見つかりません' });
      return;
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        amount: parseInt(amount),
        purpose,
        date: new Date(date),
      },
    });

    res.json(budget);
  } catch (error) {
    console.error('予算更新エラー:', error);
    res.status(500).json({ error: '予算の更新に失敗しました' });
  }
});

// 予算削除（グループ対応）
router.delete('/groups/:groupId/budgets/:id', async (req: Request, res: Response) => {
  try {
    const { groupId, id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'ユーザーIDが必要です' });
      return;
    }

    // ユーザーがグループに所属しているかチェック
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!userGroup) {
      res.status(403).json({ error: 'このグループにアクセスする権限がありません' });
      return;
    }

    // 予算が存在し、指定されたグループに属しているかチェック
    const existingBudget = await prisma.budget.findFirst({
      where: { id, groupId },
    });

    if (!existingBudget) {
      res.status(404).json({ error: '予算が見つかりません' });
      return;
    }

    await prisma.budget.delete({
      where: { id },
    });

    res.json({ message: '予算を削除しました' });
  } catch (error) {
    console.error('予算削除エラー:', error);
    res.status(500).json({ error: '予算の削除に失敗しました' });
  }
});

// 個人用予算一覧取得（後方互換性のため）
router.get('/budgets', async (req: Request, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { groupId: null },
      orderBy: { createdAt: 'desc' },
    });

    res.json(budgets);
  } catch (error) {
    console.error('予算一覧取得エラー:', error);
    res.status(500).json({ error: '予算一覧の取得に失敗しました' });
  }
});

export default router;
