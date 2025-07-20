import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth'
import incomeRoutes from './routes/incomes'
import expenseRoutes from './routes/expenses'
import categoryRoutes from './routes/categories'
import { prisma } from './lib/prisma'


const app = express()
const PORT = process.env.PORT || 3001

// CORS設定
app.use(cors({
  // origin: process.env.NODE_ENV === 'production' 
  //   ? ['https://your-frontend-domain.com'] 
  //   : ['http://localhost:3000'],
  origin: true,
  credentials: true
}))

// JSONパーサー
app.use(express.json())

// Cookieパーサー
app.use(cookieParser())

// ルート
app.use('/auth', authRoutes)
app.use('/incomes', incomeRoutes)
app.use('/expenses', expenseRoutes)
app.use('/categories', categoryRoutes)

// ヘルスチェック
app.get('/health', async (req, res) => {
  try {
    // Prismaを使ってSupabaseとの疎通確認
    // $queryRawは生のSQLクエリを実行するPrismaのメソッド
    // SELECT 1は最も軽量なクエリで、データベース接続が正常かどうかを確認するための標準的な方法
    // このクエリが成功すれば、PrismaクライアントがSupabaseデータベースに正常に接続できていることを意味する
    await prisma.$queryRaw`SELECT 1`
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected to Supabase via Prisma'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Failed to connect to Supabase',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 404ハンドラー
app.all('/{*any}', (req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' })
})

// エラーハンドラー
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'サーバーエラーが発生しました' })
})

// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`)
//   console.log(`📊 Health check: http://localhost:${PORT}/health`)
// })

export default app;