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

// 収入一覧取得（グループ対応）
export function useIncomes(groupId?: string, userId?: string) {
  const key = groupId && userId ? `/api/groups/${groupId}/incomes/list?userId=${userId}` : '/api/incomes';
  const { data, error, mutate } = useSWR(key, () => apiClient.getIncomes(groupId, userId));

  const incomes = Array.isArray(data?.data) ? data.data : [];

  // 楽観的更新関数
  const optimisticUpdate = async (newData: Income[], apiCall: () => Promise<unknown>) => {
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
    incomes,
    isLoading: !error && !data,
    isError: error,
    mutate,
    optimisticUpdate,
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
