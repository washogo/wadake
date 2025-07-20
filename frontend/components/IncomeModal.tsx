'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { incomeSchema, type IncomeFormData } from '../lib/validations'
import { Income } from '../hooks/useIncomes'

interface IncomeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: IncomeFormData) => Promise<void>
  income?: Income | null
  categories: Array<{ id: string; name: string }>
}

export default function IncomeModal({
  isOpen,
  onClose,
  onSubmit,
  income,
  categories
}: IncomeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      memo: '',
      date: new Date().toISOString().split('T')[0]
    }
  })

  // incomeプロパティが変更されたときにフォームの値を更新
  useEffect(() => {
    if (income) {
      // 編集モード：現在の値を設定
      setValue('categoryId', income.category.id)
      setValue('amount', income.amount)
      setValue('memo', income.memo || '')
      setValue('date', new Date(income.date).toISOString().split('T')[0])
    } else {
      // 新規追加モード：デフォルト値を設定
      setValue('categoryId', '')
      setValue('amount', 0)
      setValue('memo', '')
      setValue('date', new Date().toISOString().split('T')[0])
    }
  }, [income, setValue])

  const handleFormSubmit = async (data: IncomeFormData) => {
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {income ? '収入を編集' : '収入を追加'}
        </h2>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ *
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">カテゴリを選択</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              金額 *
            </label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10000"
              min="1"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付 *
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <input
              type="text"
              {...register('memo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="給料、ボーナスなど"
            />
            {errors.memo && (
              <p className="mt-1 text-sm text-red-600">{errors.memo.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : (income ? '更新' : '登録')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 