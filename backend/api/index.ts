import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import incomeRoutes from './routes/incomes';
import expenseRoutes from './routes/expenses';
import categoryRoutes from './routes/categories';
import groupRoutes from './routes/groups';
import budgetRoutes from './routes/budgets';
import summaryRoutes from './routes/summary';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定
app.use(
  cors({
    // origin: process.env.NODE_ENV === 'production'
    //   ? ['https://your-frontend-domain.com']
    //   : ['http://localhost:3000'],
    origin: true,
    credentials: true,
  })
);

// JSONパーサー
app.use(express.json());

// Cookieパーサー
app.use(cookieParser());

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/summary', summaryRoutes);

// ヘルスチェック
app.get('/health', async (req, res) => {
  try {
    // Prismaを使ってSupabaseとの疎通確認
    // $queryRawは生のSQLクエリを実行するPrismaのメソッド
    // SELECT 1は最も軽量なクエリで、データベース接続が正常かどうかを確認するための標準的な方法
    // このクエリが成功すれば、PrismaクライアントがSupabaseデータベースに正常に接続できていることを意味する
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected to Supabase via Prisma',
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Failed to connect to Supabase',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// エラーハンドラー
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// 開発環境でのみサーバーを起動（Vercelでは不要）
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
