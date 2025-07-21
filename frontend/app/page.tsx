'use client';

import { useAuth } from './providers/AuthProvider';
import { useGroup } from './providers/GroupProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { groups, currentGroupId } = useGroup();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentGroup = groups.find((g) => g.id === currentGroupId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">家計簿アプリ「wadake」</h1>
            <p className="text-gray-600">マネーフォワード風の家計管理アプリ</p>
          </div>

          {/* ユーザー・グループ情報 */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ようこそ！</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-2">
                  ユーザー名: <span className="font-medium text-gray-900">{user.name}</span>
                </p>
                <p className="text-gray-600">
                  メールアドレス: <span className="font-medium text-gray-900">{user.email}</span>
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  現在のグループ:{' '}
                  {currentGroup ? (
                    <span className="font-medium text-gray-900">{currentGroup.name}</span>
                  ) : (
                    <span className="text-gray-500">未選択</span>
                  )}
                </p>
                <p className="text-gray-600">
                  所属グループ数: <span className="font-medium text-gray-900">{groups.length}</span>
                </p>
              </div>
            </div>
            {groups.length === 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  グループに所属していません。グループ管理から新しいグループを作成するか、他のユーザーからの招待を受けてください。
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">収入管理</h3>
              <p className="text-gray-600">収入の記録と管理を行います</p>
              <button
                onClick={() => router.push('/incomes')}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                収入管理を開く
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">支出管理</h3>
              <p className="text-gray-600">支出の記録と管理を行います</p>
              <button
                onClick={() => router.push('/expenses')}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                支出管理を開く
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">グループ管理</h3>
              <p className="text-gray-600">グループの作成・メンバー管理を行います</p>
              <button
                onClick={() => router.push('/groups')}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                グループ管理を開く
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">貯金管理</h3>
              <p className="text-gray-600">貯金の記録と管理を行います</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">予算管理</h3>
              <p className="text-gray-600">予算の設定と管理を行います</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">分析</h3>
              <p className="text-gray-600">収支の分析とレポートを表示します</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">レシート解析</h3>
              <p className="text-gray-600">レシート画像から自動で支出を記録します</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
