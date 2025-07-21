'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { apiClient } from '../utils/api';
import { useAuth } from '../app/providers/AuthProvider';
import { useGroup } from '../app/providers/GroupProvider';

export interface SummaryData {
  period: string;
  date?: string;
  year?: number;
  month?: number;
  groupId?: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    totalBudget: number;
    netIncome: number;
    expenseRatio: number;
    incomeCount: number;
    expenseCount: number;
    budgetCount: number;
  };
  incomeByCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
  }>;
  expenseByCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
  }>;
}

export interface TrendData {
  trends: Array<{
    year: number;
    month: number;
    label: string;
    totalIncome: number;
    totalExpense: number;
    totalBudget: number;
    netIncome: number;
    expenseRatio: number;
    incomeCount: number;
    expenseCount: number;
    budgetCount: number;
  }>;
  groupId?: string;
}

export function useDailySummary(date?: string) {
  const { user } = useAuth();
  const { currentGroupId } = useGroup();

  const key = useMemo(() => {
    if (!user) return null;
    return `daily-summary-${date || 'today'}-${currentGroupId || 'personal'}-${user.id}`;
  }, [user, date, currentGroupId]);

  const { data, error, mutate } = useSWR(
    key,
    async () => {
      if (!user) return null;
      const result = await apiClient.getDailySummary(date, currentGroupId || undefined, user.id);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as SummaryData;
    },
    {
      refreshInterval: 30000, // 30秒ごとに更新
      revalidateOnFocus: true,
    }
  );

  return {
    summary: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useMonthlySummary(year?: number, month?: number) {
  const { user } = useAuth();
  const { currentGroupId } = useGroup();

  const key = useMemo(() => {
    if (!user) return null;
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;
    return `monthly-summary-${targetYear}-${targetMonth}-${currentGroupId || 'personal'}-${user.id}`;
  }, [user, year, month, currentGroupId]);

  const { data, error, mutate } = useSWR(
    key,
    async () => {
      if (!user) return null;
      const result = await apiClient.getMonthlySummary(year, month, currentGroupId || undefined, user.id);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as SummaryData;
    },
    {
      refreshInterval: 60000, // 1分ごとに更新
      revalidateOnFocus: true,
    }
  );

  return {
    summary: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useYearlySummary(year?: number) {
  const { user } = useAuth();
  const { currentGroupId } = useGroup();

  const key = useMemo(() => {
    if (!user) return null;
    const targetYear = year || new Date().getFullYear();
    return `yearly-summary-${targetYear}-${currentGroupId || 'personal'}-${user.id}`;
  }, [user, year, currentGroupId]);

  const { data, error, mutate } = useSWR(
    key,
    async () => {
      if (!user) return null;
      const result = await apiClient.getYearlySummary(year, currentGroupId || undefined, user.id);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as SummaryData;
    },
    {
      refreshInterval: 120000, // 2分ごとに更新
      revalidateOnFocus: true,
    }
  );

  return {
    summary: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useTrendSummary() {
  const { user } = useAuth();
  const { currentGroupId } = useGroup();

  const key = useMemo(() => {
    if (!user) return null;
    return `trend-summary-${currentGroupId || 'personal'}-${user.id}`;
  }, [user, currentGroupId]);

  const { data, error, mutate } = useSWR(
    key,
    async () => {
      if (!user) return null;
      const result = await apiClient.getTrendSummary(currentGroupId || undefined, user.id);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as TrendData;
    },
    {
      refreshInterval: 300000, // 5分ごとに更新
      revalidateOnFocus: true,
    }
  );

  return {
    trends: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}
