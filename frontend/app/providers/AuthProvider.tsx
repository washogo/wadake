'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authManager, AuthState } from '../../utils/auth'

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // 認証状態を初期化
    const initializeAuth = async () => {
      const state = await authManager.initializeAuth()
      setAuthState(state)
    }

    initializeAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = authManager.onAuthStateChange((state) => {
      setAuthState(state)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    return await authManager.signInWithGoogle()
  }

  const signOut = async () => {
    await authManager.signOut()
  }

  const value: AuthContextType = {
    ...authState,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 