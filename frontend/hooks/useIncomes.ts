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
  // groupIdとuserIdの両方が存在するか、両方ともundefinedの場合のみフェッチを実行
  const shouldFetch = (groupId && userId) || (!groupId && !userId);
  const key = groupId && userId ? `/api/groups/${groupId}/incomes/list?userId=${userId}` : '/api/incomes';

  const { data, error, mutate } = useSWR(shouldFetch ? key : null, () => apiClient.getIncomes(groupId, userId));

  const incomes = Array.isArray(data?.data) ? data.data : [];

  // 楽観的更新関数
  const optimisticUpdate = async (newData: Income[], apiCall: () => Promise<unknown>) => {
    // 即座にUIを更新
    mutate({ data: newData }, false);

    try {
      // バックグラウンドでAPIを実行
      await apiCall();
      // 成功時は楽観的更新したデータがそのまま正しいので、追加のフェッチは不要
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
