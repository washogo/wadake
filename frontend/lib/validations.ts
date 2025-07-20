import { z } from 'zod'

// 収入登録・編集用のバリデーションスキーマ
export const incomeSchema = z.object({
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  amount: z.number().min(1, '金額は1円以上で入力してください'),
  memo: z.string().optional(),
  date: z.string().min(1, '日付を選択してください')
})

export type IncomeFormData = z.infer<typeof incomeSchema>

// 支出登録・編集用のバリデーションスキーマ
export const expenseSchema = z.object({
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  amount: z.number().min(1, '金額は1円以上で入力してください'),
  description: z.string().optional(),
  date: z.string().min(1, '日付を選択してください')
})

export type ExpenseFormData = z.infer<typeof expenseSchema> 