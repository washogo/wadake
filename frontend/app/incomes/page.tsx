'use client'

import { useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { apiClient } from '../../utils/api'
import { useRouter } from 'next/navigation'
import { useIncomes, useIncomeCategories, type Income } from '../../hooks/useIncomes'
import { type IncomeFormData } from '../../lib/validations'
import IncomeModal from '../../components/IncomeModal'
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'

export default function IncomesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { incomes, isLoading: incomesLoading, mutate } = useIncomes()
  const { categories, isLoading: categoriesLoading } = useIncomeCategories()
  
  const [showModal, setShowModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 認証チェック
  if (!isLoading && !user) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (data: IncomeFormData) => {
    try {
      if (editingIncome) {
        await apiClient.updateIncome(editingIncome.id, {
          categoryId: data.categoryId,
          amount: data.amount,
          memo: data.memo || undefined,
          date: data.date
        })
      } else {
        await apiClient.createIncome({
          categoryId: data.categoryId,
          amount: data.amount,
          memo: data.memo || undefined,
          date: data.date
        })
      }
      
      mutate() // SWRでデータを再取得
    } catch (error) {
      console.error('Error saving income:', error)
      throw error
    }
  }

  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    setShowModal(true)
  }

  const handleDelete = (income: Income) => {
    setDeletingIncome(income)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingIncome) return
    
    try {
      setIsDeleting(true)
      await apiClient.deleteIncome(deletingIncome.id)
      mutate() // SWRでデータを再取得
      setShowDeleteDialog(false)
      setDeletingIncome(null)
    } catch (error) {
      console.error('Error deleting income:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount)
  }

  if (isLoading || incomesLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">収入管理</h1>
            <button
              onClick={() => {
                setEditingIncome(null)
                setShowModal(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              収入を追加
            </button>
          </div>

          {/* 収入一覧 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">収入一覧</h3>
            </div>
            
            {incomes.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                収入データがありません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日付
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        カテゴリ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金額
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メモ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incomes.map((income) => (
                      <tr key={income.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(income.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {income.category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ¥{formatAmount(income.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {income.memo || '-'}
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <button
                             onClick={() => handleEdit(income)}
                             className="text-blue-600 hover:text-blue-900 mr-3"
                           >
                             編集
                           </button>
                           <button
                             onClick={() => handleDelete(income)}
                             className="text-red-600 hover:text-red-900"
                           >
                             削除
                           </button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* モーダルとダイアログ */}
      <IncomeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingIncome(null)
        }}
        onSubmit={handleSubmit}
        income={editingIncome}
        categories={categories}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingIncome(null)
        }}
        onConfirm={confirmDelete}
        title="収入を削除"
        message={`「${deletingIncome?.category.name} - ¥${deletingIncome ? formatAmount(deletingIncome.amount) : ''}」を削除しますか？`}
        isLoading={isDeleting}
      />
    </div>
  )
} 