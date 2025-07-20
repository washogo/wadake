import useSWR from 'swr'
import { apiClient } from '../utils/api'

export interface Income {
  id: string
  amount: number
  memo: string | null
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

// 収入一覧取得
export function useIncomes() {
  const { data, error, mutate } = useSWR(
    '/api/incomes',
    () => apiClient.getIncomes()
  )

  return {
    incomes: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// 収入カテゴリ取得
export function useIncomeCategories() {
  const { data, error } = useSWR(
    '/api/categories/income',
    () => apiClient.getIncomeCategories()
  )

  return {
    categories: data?.data || [],
    isLoading: !error && !data,
    isError: error
  }
} 