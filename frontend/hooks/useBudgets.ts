import useSWR from 'swr';
import { apiClient } from '../utils/api';

export interface Budget {
  id: string;
  amount: number;
  purpose: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// 予算一覧取得（グループ対応）
export function useBudgets(groupId?: string, userId?: string) {
  // groupIdとuserIdの両方が存在するか、両方ともundefinedの場合のみフェッチを実行
  const shouldFetch = (groupId && userId) || (!groupId && !userId);
  const key = groupId && userId ? `/api/groups/${groupId}/budgets/list?userId=${userId}` : '/api/budgets';

  const { data, error, mutate } = useSWR(shouldFetch ? key : null, () => apiClient.getBudgets(groupId, userId));

  const budgets = Array.isArray(data?.data) ? data.data : [];

  // 楽観的更新関数
  const optimisticUpdate = async (newData: Budget[], apiCall: () => Promise<unknown>) => {
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
    budgets,
    isLoading: !error && !data,
    isError: error,
    mutate,
    optimisticUpdate,
  };
}
