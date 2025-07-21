'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema, type BudgetFormData } from '../lib/validations';
import type { Budget } from '../hooks/useBudgets';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  budget?: Budget | null;
}

export default function BudgetModal({ isOpen, onClose, onSubmit, budget }: BudgetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
  });

  useEffect(() => {
    if (budget) {
      reset({
        amount: budget.amount,
        purpose: budget.purpose,
        date: budget.date.split('T')[0], // YYYY-MM-DD形式に変換
      });
    } else {
      reset({
        amount: 0,
        purpose: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [budget, reset]);

  const handleFormSubmit = async (data: BudgetFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('予算の保存に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />

        <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">{budget ? '予算を編集' : '予算を追加'}</h3>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* 金額 */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                金額
              </label>
              <input
                type="number"
                id="amount"
                {...register('amount', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="10000"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
            </div>

            {/* 用途 */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                用途
              </label>
              <input
                type="text"
                id="purpose"
                {...register('purpose')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="外出時の予算"
              />
              {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>}
            </div>

            {/* 日付 */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                日付
              </label>
              <input
                type="date"
                id="date"
                {...register('date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
            </div>

            {/* ボタン */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? '保存中...' : budget ? '更新' : '追加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
