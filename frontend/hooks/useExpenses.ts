import useSWR from 'swr'
import { apiClient } from '../utils/api'

export interface Expense {
  id: string
  amount: number
  description: string | null
  date: string
  category: {
    id: string
    name: string
    type: string
  }
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: string
  createdAt: string
  updatedAt: string
}

// 支出一覧取得（グループ対応）
export function useExpenses(groupId?: string) {
  const key = groupId ? `/api/groups/${groupId}/expenses` : '/api/expenses'
  const { data, error, mutate } = useSWR(
    key,
    () => apiClient.getExpenses(groupId)
  )

  const expenses = Array.isArray(data?.data) ? data.data : []

  return {
    expenses,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// 支出カテゴリ取得
export function useExpenseCategories() {
  const { data, error } = useSWR(
    '/api/categories/expense',
    () => apiClient.getExpenseCategories()
  )

  return {
    categories: data?.data || [],
    isLoading: !error && !data,
    isError: error
  }
} 