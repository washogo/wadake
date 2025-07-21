'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { incomeSchema, type IncomeFormData } from '../lib/validations';
import { Income } from '../hooks/useIncomes';
import { format } from 'date-fns';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncomeFormData) => Promise<void>;
  income?: Income | null;
  categories: Array<{ id: string; name: string }>;
}

export default function IncomeModal({ isOpen, onClose, onSubmit, income, categories }: IncomeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      memo: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  // incomeプロパティが変更されたときにフォームの値を更新
  useEffect(() => {
    if (income) {
      // 編集モード：現在の値を設定
      reset({
        categoryId: income.category.id,
        amount: income.amount,
        memo: income.memo || '',
        date: format(new Date(income.date), 'yyyy-MM-dd'),
      });
    } else {
      // 新規追加モード：デフォルト値にリセット
      reset({
        categoryId: '',
        amount: 0,
        memo: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [income, reset]);

  const handleFormSubmit = async (data: IncomeFormData) => {
    try {
      await onSubmit(data);
      // フォーム送信後にフォームをリセット
      reset({
        categoryId: '',
        amount: 0,
        memo: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    // モーダルを閉じる際にフォームをリセット
    reset({
      categoryId: '',
      amount: 0,
      memo: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{income ? '収入を編集' : '収入を追加'}</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* 金額入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">¥</span>
              <input
                type="number"
                {...register('amount', { valueAsNumber: true })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-medium text-black"
                placeholder="0"
                min="1"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
          </div>

          {/* カテゴリ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
            >
              <option value="">カテゴリを選択</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
          </div>

          {/* 日付選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
            <textarea
              {...register('memo')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-black"
              placeholder="収入の詳細を入力（任意）"
            />
            {errors.memo && <p className="mt-1 text-sm text-red-600">{errors.memo.message}</p>}
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? '保存中...' : income ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
