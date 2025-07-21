'use client'

import { useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { useGroup } from '../providers/GroupProvider'
import { apiClient } from '../../utils/api'
import { useRouter } from 'next/navigation'
import { useExpenses, useExpenseCategories, type Expense } from '../../hooks/useExpenses'
import { type ExpenseFormData } from '../../lib/validations'
import ExpenseModal from '../../components/ExpenseModal'
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import { formatDate, isCurrentMonthByInterval } from '../../utils/dateUtils'

export default function ExpensesPage() {
  const { user, isLoading } = useAuth()
  const { currentGroupId } = useGroup()
  const router = useRouter()
  const { expenses, isLoading: expensesLoading, mutate } = useExpenses(currentGroupId || undefined)
  const { categories, isLoading: categoriesLoading } = useExpenseCategories()
  
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 認証チェック
  if (!isLoading && !user) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      if (editingExpense) {
        await apiClient.updateExpense(editingExpense.id, {
          categoryId: data.categoryId,
          amount: data.amount,
          description: data.description || undefined,
          date: data.date,
          groupId: currentGroupId || undefined
        })
      } else {
        await apiClient.createExpense({
          categoryId: data.categoryId,
          amount: data.amount,
          description: data.description || undefined,
          date: data.date,
          groupId: currentGroupId || undefined
        })
      }
      
      mutate() // SWRでデータを再取得
    } catch (error) {
      console.error('Error saving expense:', error)
      throw error
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setShowModal(true)
  }

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingExpense) return
    
    try {
      setIsDeleting(true)
      await apiClient.deleteExpense(deletingExpense.id, currentGroupId || undefined)
      mutate() // SWRでデータを再取得
      setShowDeleteDialog(false)
      setDeletingExpense(null)
    } catch (error) {
      console.error('Error deleting expense:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount)
  }

  // 今月の支出合計を計算
  const monthlyTotal = expenses
    .filter(expense => isCurrentMonthByInterval(expense.date))
    .reduce((sum, expense) => sum + expense.amount, 0)

  // 今月の記録件数を計算
  const monthlyCount = expenses.filter(expense => isCurrentMonthByInterval(expense.date)).length

  if (isLoading || expensesLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">支出管理</h1>
            <p className="text-gray-600">毎日の支出を記録して家計を管理しましょう</p>
          </div>

          {/* 今月の支出サマリー */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium mb-1">今月の支出</h2>
                <p className="text-3xl font-bold">¥{formatAmount(monthlyTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">記録件数</p>
                <p className="text-2xl font-bold">
                  {monthlyCount}件
                </p>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">支出履歴</h2>
            <button
              onClick={() => {
                setEditingExpense(null)
                setShowModal(true)
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-md"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                支出を追加
              </span>
            </button>
          </div>

          {/* 支出一覧 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {expenses.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">支出データがありません</h3>
                <p className="text-gray-500 mb-4">最初の支出を記録してみましょう</p>
                <button
                  onClick={() => {
                    setEditingExpense(null)
                    setShowModal(true)
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  支出を追加
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* カテゴリアイコン */}
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {expense.category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(expense.date)}
                          </p>
                          {expense.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-red-600">
                            -¥{formatAmount(expense.amount)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(expense)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      <ExpenseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingExpense(null)
        }}
        onSubmit={handleSubmit}
        expense={editingExpense}
        categories={categories}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingExpense(null)
        }}
        onConfirm={confirmDelete}
        title="支出を削除"
        message={`「${deletingExpense?.category.name} - ¥${deletingExpense ? formatAmount(deletingExpense.amount) : ''}」を削除しますか？`}
        isLoading={isDeleting}
      />
    </div>
  )
} 