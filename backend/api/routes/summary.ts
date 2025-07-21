import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// すべてのルートで認証を必須とする
router.use(authenticateToken);

// 集計データを取得するヘルパー関数
async function getSummaryData(userId: string, groupId: string | null, startDate: Date, endDate: Date) {
  const whereCondition = groupId
    ? { groupId, date: { gte: startDate, lte: endDate } }
    : { userId, groupId: null, date: { gte: startDate, lte: endDate } };

  // 収入の集計
  const incomeTotal = await prisma.income.aggregate({
    where: whereCondition,
    _sum: { amount: true },
    _count: true,
  });

  // 支出の集計
  const expenseTotal = await prisma.expense.aggregate({
    where: whereCondition,
    _sum: { amount: true },
    _count: true,
  });

  // 予算の集計
  const budgetTotal = await prisma.budget.aggregate({
    where: groupId
      ? { groupId, date: { gte: startDate, lte: endDate } }
      : { groupId: null, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
    _count: true,
  });

  // カテゴリ別収入
  const incomeByCategory = await prisma.income.groupBy({
    by: ['categoryId'],
    where: whereCondition,
    _sum: { amount: true },
    _count: true,
  });

  // カテゴリ別支出
  const expenseByCategory = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: whereCondition,
    _sum: { amount: true },
    _count: true,
  });

  // カテゴリ情報を取得
  const incomeCategories = await prisma.category.findMany({
    where: {
      id: { in: incomeByCategory.map((item) => item.categoryId) },
      type: 'income',
    },
    select: { id: true, name: true },
  });

  const expenseCategories = await prisma.category.findMany({
    where: {
      id: { in: expenseByCategory.map((item) => item.categoryId) },
      type: 'expense',
    },
    select: { id: true, name: true },
  });

  const totalIncome = incomeTotal._sum.amount || 0;
  const totalExpense = expenseTotal._sum.amount || 0;
  const totalBudget = budgetTotal._sum.amount || 0;
  const netIncome = totalIncome - totalExpense;
  const expenseRatio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  return {
    summary: {
      totalIncome,
      totalExpense,
      totalBudget,
      netIncome,
      expenseRatio,
      incomeCount: incomeTotal._count,
      expenseCount: expenseTotal._count,
      budgetCount: budgetTotal._count,
    },
    incomeByCategory: incomeByCategory.map((item) => ({
      categoryId: item.categoryId,
      categoryName: incomeCategories.find((cat) => cat.id === item.categoryId)?.name || 'Unknown',
      amount: item._sum.amount || 0,
      count: item._count,
    })),
    expenseByCategory: expenseByCategory.map((item) => ({
      categoryId: item.categoryId,
      categoryName: expenseCategories.find((cat) => cat.id === item.categoryId)?.name || 'Unknown',
      amount: item._sum.amount || 0,
      count: item._count,
    })),
  };
}

// 日別集計
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { groupId, date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    // 当日の開始と終了
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const data = await getSummaryData(userId, (groupId as string) || null, startDate, endDate);

    res.json({
      period: 'daily',
      date: targetDate.toISOString().split('T')[0],
      ...data,
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 月別集計
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { groupId, year, month } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;

    // 月の開始と終了
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const data = await getSummaryData(userId, (groupId as string) || null, startDate, endDate);

    res.json({
      period: 'monthly',
      year: targetYear,
      month: targetMonth,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 年別集計
router.get('/yearly', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { groupId, year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    // 年の開始と終了
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const data = await getSummaryData(userId, (groupId as string) || null, startDate, endDate);

    res.json({
      period: 'yearly',
      year: targetYear,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching yearly summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 月別トレンド（過去12ヶ月）
router.get('/trend', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { groupId } = req.query;
    const now = new Date();
    const trends = [];

    // 過去12ヶ月のデータを取得
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const data = await getSummaryData(userId, (groupId as string) || null, startDate, endDate);

      trends.push({
        year,
        month,
        label: `${year}年${month}月`,
        ...data.summary,
      });
    }

    res.json({ trends });
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// グループ用の集計エンドポイント
router.post('/groups/:groupId/daily', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const { date } = req.query;

    // グループメンバーかチェック
    const membership = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership) {
      res.status(403).json({ error: 'グループのメンバーではありません' });
      return;
    }

    const targetDate = date ? new Date(date as string) : new Date();
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const data = await getSummaryData(userId, groupId, startDate, endDate);

    res.json({
      period: 'daily',
      date: targetDate.toISOString().split('T')[0],
      groupId,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching group daily summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/groups/:groupId/monthly', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const { year, month } = req.query;

    // グループメンバーかチェック
    const membership = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership) {
      res.status(403).json({ error: 'グループのメンバーではありません' });
      return;
    }

    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const data = await getSummaryData(userId, groupId, startDate, endDate);

    res.json({
      period: 'monthly',
      year: targetYear,
      month: targetMonth,
      groupId,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching group monthly summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/groups/:groupId/yearly', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const { year } = req.query;

    // グループメンバーかチェック
    const membership = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership) {
      res.status(403).json({ error: 'グループのメンバーではありません' });
      return;
    }

    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const data = await getSummaryData(userId, groupId, startDate, endDate);

    res.json({
      period: 'yearly',
      year: targetYear,
      groupId,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching group yearly summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/groups/:groupId/trend', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // グループメンバーかチェック
    const membership = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership) {
      res.status(403).json({ error: 'グループのメンバーではありません' });
      return;
    }

    const now = new Date();
    const trends = [];

    // 過去12ヶ月のデータを取得
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const data = await getSummaryData(userId, groupId, startDate, endDate);

      trends.push({
        year,
        month,
        label: `${year}年${month}月`,
        ...data.summary,
      });
    }

    res.json({ trends, groupId });
  } catch (error) {
    console.error('Error fetching group trend data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
