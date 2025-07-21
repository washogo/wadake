'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../app/providers/AuthProvider';
import { useGroup } from '../app/providers/GroupProvider';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { groups, currentGroupId, setCurrentGroupId } = useGroup();

  // ログインページではヘッダーを表示しない
  if (pathname === '/login') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navigationItems = [
    { name: 'ホーム', path: '/', icon: '🏠' },
    { name: '収入管理', path: '/incomes', icon: '💰' },
    { name: '支出管理', path: '/expenses', icon: '💸' },
    { name: 'グループ管理', path: '/groups', icon: '👥' },
    { name: '貯金管理', path: '/savings', icon: '🏦' },
    { name: '予算管理', path: '/budgets', icon: '📊' },
    { name: '分析', path: '/analytics', icon: '📈' },
  ];

  return (
    <>
      {/* デスクトップヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-green-600 transition-colors"
              >
                <span className="text-2xl">💰</span>
                <span>wadake</span>
              </button>
              {/* グループ切り替えドロップダウン */}
              {groups.length > 0 && (
                <select
                  value={currentGroupId || ''}
                  onChange={(e) => setCurrentGroupId(e.target.value)}
                  className="ml-4 px-3 py-1 rounded border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                  style={{ minWidth: 120 }}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                </button>
              ))}
            </nav>

            {/* ユーザーメニュー */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>👤 {user?.name}</span>
              </div>

              {/* ハンバーガーメニューボタン（モバイル） */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* ログアウトボタン（デスクトップ） */}
              <button
                onClick={handleSignOut}
                className="hidden md:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* オーバーレイ */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />

          {/* メニューパネル */}
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* メニューヘッダー */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* ユーザー情報 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* ナビゲーションメニュー */}
              <nav className="flex-1 p-6">
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive(item.path)
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* ログアウトボタン */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>ログアウト</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
