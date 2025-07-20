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

// 支出一覧取得
export function useExpenses() {
  const { data, error, mutate } = useSWR(
    '/api/expenses',
    () => apiClient.getExpenses()
  )

  return {
    expenses: data?.data || [],
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