'use client'

import { useAuth } from './providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (isLoading) {
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
            <h1 className="text-3xl font-bold text-gray-900">家計簿アプリ「wadake」</h1>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              ログアウト
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ようこそ！</h2>
            <p className="text-gray-600 mb-4">
              メールアドレス: {user.email}
            </p>
            <p className="text-gray-600">
              ユーザー名: {user.name}
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">収入管理</h3>
              <p className="text-gray-600">収入の記録と管理を行います</p>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">支出管理</h3>
              <p className="text-gray-600">支出の記録と管理を行います</p>
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
  )
} 