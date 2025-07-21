import useSWR from 'swr';
import { apiClient } from '../utils/api';

export interface Income {
  id: string;
  amount: number;
  memo: string | null;
  date: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// 収入一覧取得（グループ対応）
export function useIncomes(groupId?: string, userId?: string) {
  const key = groupId && userId ? `/api/groups/${groupId}/incomes/list?userId=${userId}` : '/api/incomes';
  const { data, error, mutate } = useSWR(key, () => apiClient.getIncomes(groupId, userId));

  const incomes = Array.isArray(data?.data) ? data.data : [];

  return {
    incomes,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// 収入カテゴリ取得
export function useIncomeCategories() {
  const { data, error } = useSWR('/api/categories/income', () => apiClient.getIncomeCategories());

  return {
    categories: data?.data || [],
    isLoading: !error && !data,
    isError: error,
  };
}
