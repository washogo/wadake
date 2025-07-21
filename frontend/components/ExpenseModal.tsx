'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, type ExpenseFormData } from '../lib/validations';
import { type Category } from '../hooks/useExpenses';
import { format } from 'date-fns';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  expense?: {
    id: string;
    amount: number;
    description: string | null;
    date: string;
    category: {
      id: string;
      name: string;
    };
  } | null;
  categories: Category[];
}

export default function ExpenseModal({ isOpen, onClose, onSubmit, expense, categories }: ExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        categoryId: expense.category.id,
        amount: expense.amount,
        description: expense.description || '',
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
      });
    } else {
      reset({
        categoryId: '',
        amount: 0,
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [expense, reset]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      // フォーム送信後にフォームをリセット
      reset({
        categoryId: '',
        amount: 0,
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // モーダルを閉じる際にフォームをリセット
    reset({
      categoryId: '',
      amount: 0,
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{expense ? '支出を編集' : '支出を追加'}</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
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
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-medium text-black"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          {/* 説明文 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-black"
              placeholder="支出の詳細を入力（任意）"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
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
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? '保存中...' : expense ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
