'use client';

import { useState, useMemo, useCallback } from 'react';
import { useMonthlySummary, useTrendSummary } from '../../hooks/useSummary';
import { useAuth } from '../providers/AuthProvider';

// 金額フォーマット用のヘルパー関数
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('ja-JP').format(amount);
};

export default function SummaryPage() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { summary, isLoading: summaryLoading, error: summaryError } = useMonthlySummary(selectedYear, selectedMonth);
  const { trends, isLoading: trendsLoading, error: trendsError } = useTrendSummary();

  // 年と月の選択肢をメモ化
  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  // イベントハンドラーをメモ化
  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  }, []);

  const handleMonthChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
          <p className="text-gray-600">集計データを表示するにはログインしてください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">収支分析</h1>
          <p className="text-gray-600">収入・支出の詳細な分析と割合を確認できます</p>
        </div>

        {/* 期間選択 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">期間選択</h2>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年</label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">月</label>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ローディング状態 */}
        {summaryLoading ? (
          <div className="space-y-8">
            {/* スケルトンローディング - サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* スケルトンローディング - 支出割合 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto"></div>
                  </div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* スケルトンローディング - カテゴリ別 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ローディングメッセージ */}
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <div>
                  <p className="text-gray-900 font-medium">収支データを分析中...</p>
                  <p className="text-gray-500 text-sm">カテゴリ別集計と割合を計算しています</p>
                </div>
              </div>
            </div>
          </div>
        ) : summaryError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">データの取得に失敗しました: {summaryError.message}</p>
          </div>
        ) : summary ? (
          <>
            {/* 月次サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 総収入 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総収入</p>
                    <p className="text-2xl font-bold text-gray-900">¥{formatAmount(summary.summary.totalIncome)}</p>
                    <p className="text-sm text-gray-500">{summary.summary.incomeCount}件</p>
                  </div>
                </div>
              </div>

              {/* 総支出 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総支出</p>
                    <p className="text-2xl font-bold text-gray-900">¥{formatAmount(summary.summary.totalExpense)}</p>
                    <p className="text-sm text-gray-500">{summary.summary.expenseCount}件</p>
                  </div>
                </div>
              </div>

              {/* 純利益 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      summary.summary.netIncome >= 0 ? 'bg-blue-100' : 'bg-red-100'
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${summary.summary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">純利益</p>
                    <p
                      className={`text-2xl font-bold ${
                        summary.summary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}
                    >
                      {summary.summary.netIncome >= 0 ? '+' : ''}¥{formatAmount(summary.summary.netIncome)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 支出率 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">支出率</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.summary.expenseRatio}%</p>
                    <p className="text-sm text-gray-500">収入に対する支出の割合</p>
                  </div>
                </div>
              </div>
            </div>

            {/* カテゴリ別分析 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* 収入カテゴリ */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">収入カテゴリ別</h3>
                {summary.incomeByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {summary.incomeByCategory.map((item) => (
                      <div key={item.categoryId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.categoryName}</p>
                          <p className="text-sm text-gray-500">{item.count}件</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">¥{formatAmount(item.amount)}</p>
                          <p className="text-sm text-gray-500">
                            {summary.summary.totalIncome > 0
                              ? Math.round((item.amount / summary.summary.totalIncome) * 100)
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">収入データがありません</p>
                )}
              </div>

              {/* 支出カテゴリ */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">支出カテゴリ別</h3>
                {summary.expenseByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {summary.expenseByCategory.map((item) => (
                      <div key={item.categoryId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.categoryName}</p>
                          <p className="text-sm text-gray-500">{item.count}件</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">¥{formatAmount(item.amount)}</p>
                          <p className="text-sm text-gray-500">
                            {summary.summary.totalExpense > 0
                              ? Math.round((item.amount / summary.summary.totalExpense) * 100)
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">支出データがありません</p>
                )}
              </div>
            </div>
          </>
        ) : null}

        {/* トレンドデータ */}
        {trendsLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {/* テーブルヘッダー */}
                <div className="grid grid-cols-5 gap-4 py-3 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                </div>
                {/* テーブル行 */}
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 ml-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 ml-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 ml-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                  </div>
                ))}
              </div>
              <div className="text-center py-4">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                  <span className="text-gray-600 text-sm">トレンドデータを読み込み中...</span>
                </div>
              </div>
            </div>
          </div>
        ) : trendsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">トレンドデータの取得に失敗しました: {trendsError.message}</p>
          </div>
        ) : !trendsLoading && !trendsError && trends ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">過去12ヶ月のトレンド</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">月</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">収入</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">支出</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">純利益</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">支出率</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.trends.map((trend) => (
                    <tr key={`${trend.year}-${trend.month}`} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{trend.label}</td>
                      <td className="text-right py-3 px-4 text-green-600">¥{formatAmount(trend.totalIncome)}</td>
                      <td className="text-right py-3 px-4 text-red-600">¥{formatAmount(trend.totalExpense)}</td>
                      <td className={`text-right py-3 px-4 ${trend.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {trend.netIncome >= 0 ? '+' : ''}¥{formatAmount(trend.netIncome)}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-900">{trend.expenseRatio}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
