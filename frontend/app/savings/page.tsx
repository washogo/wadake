'use client';

import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function SavingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ログインが必要です</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">貯金管理</h1>
              <p className="mt-2 text-gray-600">貯金目標を設定して計画的に資産を増やしましょう</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => {
                  // TODO: 貯金目標追加モーダルを開く
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <span className="mr-2">🏦</span>
                貯金目標を追加
              </button>
            </div>
          </div>
        </div>

        {/* 準備中メッセージ */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🏦</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">貯金管理機能は準備中です</h3>
            <p className="text-gray-600 mb-6">
              現在、貯金目標の設定と進捗管理機能を開発中です。
              <br />
              近日中にリリース予定です。
            </p>

            {/* 予定機能の案内 */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-indigo-900 mb-4">実装予定の機能</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start space-x-2">
                    <span className="text-indigo-600">✓</span>
                    <span className="text-indigo-800">貯金目標の設定</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-indigo-600">✓</span>
                    <span className="text-indigo-800">進捗の可視化</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-indigo-600">✓</span>
                    <span className="text-indigo-800">自動積立設定</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-indigo-600">✓</span>
                    <span className="text-indigo-800">貯金履歴管理</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-indigo-600">✓</span>
                    <span className="text-indigo-800">目標達成通知</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-indigo-600">✓</span>
                    <span className="text-indigo-800">グループ共有機能</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-x-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                ホームに戻る
              </button>
              <button
                onClick={() => router.push('/summary')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                収支分析を見る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
