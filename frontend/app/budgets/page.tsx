'use client';

import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useGroup } from '../providers/GroupProvider';
import { apiClient } from '../../utils/api';
import { useRouter } from 'next/navigation';
import { useBudgets, type Budget } from '../../hooks/useBudgets';
import { type BudgetFormData } from '../../lib/validations';
import BudgetModal from '../../components/BudgetModal';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { formatDate, isCurrentMonthByInterval } from '../../utils/dateUtils';

export default function BudgetsPage() {
  const { user, isLoading } = useAuth();
  const { currentGroupId, isLoading: groupLoading } = useGroup();
  const router = useRouter();
  const {
    budgets,
    isLoading: budgetsLoading,
    mutate,
    optimisticUpdate,
  } = useBudgets(currentGroupId || undefined, user?.id);

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 認証チェック
  if (!isLoading && !user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      if (editingBudget) {
        // 楽観的更新で即座にUIを更新
        await optimisticUpdate(
          budgets?.map((budget) => (budget.id === editingBudget.id ? { ...budget, ...data } : budget)) || [],
          async () => {
            const updatedData = {
              ...data,
              groupId: currentGroupId || undefined,
              userId: user?.id,
            };
            const response = await apiClient.updateBudget(editingBudget.id, updatedData);
            if (response.error) {
              throw new Error(response.error);
            }
            return response.data;
          }
        );
      } else {
        // 楽観的更新で即座にUIを更新
        const newBudget: Budget = {
          id: Date.now().toString(), // 一時的なID
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await optimisticUpdate([newBudget, ...(budgets || [])], async () => {
          const createData = {
            ...data,
            groupId: currentGroupId || undefined,
            userId: user?.id,
          };
          const response = await apiClient.createBudget(createData);
          if (response.error) {
            throw new Error(response.error);
          }
          return response.data;
        });
      }
      setShowModal(false);
      setEditingBudget(null);
    } catch (error) {
      console.error('予算の保存に失敗しました:', error);
      // エラー時にはデータを再取得
      mutate();
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const handleDelete = (budget: Budget) => {
    setDeletingBudget(budget);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingBudget) return;

    try {
      setIsDeleting(true);
      // 楽観的更新で即座にUIを更新（削除対象を除外）
      await optimisticUpdate(budgets?.filter((budget) => budget.id !== deletingBudget.id) || [], async () => {
        const response = await apiClient.deleteBudget(deletingBudget.id, currentGroupId || undefined, user?.id);
        if (response.error) {
          throw new Error(response.error);
        }
        return response.data;
      });
      setShowDeleteDialog(false);
      setDeletingBudget(null);
    } catch (error) {
      console.error('予算の削除に失敗しました:', error);
      // エラー時にはデータを再取得
      mutate();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  // 今月の予算合計を計算
  const monthlyTotal = budgets
    .filter((budget) => isCurrentMonthByInterval(budget.date))
    .reduce((sum, budget) => sum + budget.amount, 0);

  // 今月の記録件数を計算
  const monthlyCount = budgets.filter((budget) => isCurrentMonthByInterval(budget.date)).length;

  if (isLoading || groupLoading || budgetsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">予算管理</h1>
            <p className="text-gray-600">外出時の予算を設定して管理しましょう</p>
          </div>

          {/* 今月の予算サマリー */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium mb-1">今月の予算</h2>
                <p className="text-3xl font-bold">¥{formatAmount(monthlyTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">記録件数</p>
                <p className="text-2xl font-bold">{monthlyCount}件</p>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">予算履歴</h2>
            <button
              onClick={() => {
                setEditingBudget(null);
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                予算を追加
              </span>
            </button>
          </div>

          {/* 予算一覧 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {budgets.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">予算データがありません</h3>
                <p className="text-gray-500 mb-4">最初の予算を設定してみましょう</p>
                <button
                  onClick={() => {
                    setEditingBudget(null);
                    setShowModal(true);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  予算を追加
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {budgets.map((budget) => (
                  <div key={budget.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* 予算アイコン */}
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{budget.purpose}</h3>
                          <p className="text-sm text-gray-500">{formatDate(budget.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">¥{formatAmount(budget.amount)}</p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(budget)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* モーダルとダイアログ */}
      <BudgetModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBudget(null);
        }}
        onSubmit={handleSubmit}
        budget={editingBudget}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingBudget(null);
        }}
        onConfirm={confirmDelete}
        title="予算を削除"
        message={`「${deletingBudget?.purpose} - ¥${
          deletingBudget ? formatAmount(deletingBudget.amount) : ''
        }」を削除しますか？`}
        isLoading={isDeleting}
      />
    </div>
  );
}
