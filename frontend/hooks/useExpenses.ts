import useSWR from 'swr';
import { apiClient } from '../utils/api';

export interface Expense {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  user?: {
    id: string;
    name: string;
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

// 支出一覧取得（グループ対応）
export function useExpenses(groupId?: string, userId?: string) {
  const key = groupId && userId ? `/api/groups/${groupId}/expenses/list?userId=${userId}` : '/api/expenses';
  const { data, error, mutate } = useSWR(key, () => apiClient.getExpenses(groupId, userId));

  const expenses = Array.isArray(data?.data) ? data.data : [];

  // 楽観的更新関数
  const optimisticUpdate = async (
    newData: Expense[],
    apiCall: () => Promise<unknown>
  ) => {
    // 即座にUIを更新
    mutate({ data: newData }, false);

    try {
      // バックグラウンドでAPIを実行
      await apiCall();
      // 成功後にサーバーからデータを再取得
      mutate();
    } catch (error) {
      // エラー時は元のデータに戻す
      mutate();
      throw error;
    }
  };

  return {
    expenses,
    isLoading: !error && !data,
    isError: error,
    mutate,
    optimisticUpdate,
  };
}

// 支出カテゴリ取得
export function useExpenseCategories() {
  const { data, error } = useSWR('/api/categories/expense', () => apiClient.getExpenseCategories());

  return {
    categories: data?.data || [],
    isLoading: !error && !data,
    isError: error,
  };
}
